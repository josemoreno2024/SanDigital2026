// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PoolChainV6
 * @notice PoolChain uses USDT with 6 decimals.
 * @dev THIS CONTRACT IS IDENTICAL FOR TESTNET AND MAINNET (opBNB).
 *
 * All amounts are expressed in USDT with 6 decimals.
 * Example:
 * 1 USDT = 1_000_000
 * 2 USDT = 2_000_000
 */
contract PoolChainV6 is Ownable, ReentrancyGuard, Pausable {

    // =============================================================
    // CONSTANTS — USDT (6 DECIMALS)
    // =============================================================

    uint256 public constant DECIMALS = 6;

    uint256 public constant TICKET_PRICE = 2 * 10**DECIMALS; // 2 USDT
    uint256 public constant MAX_PARTICIPANTS = 100;

    // Distribution (200 USDT total)
    // 95% prizes = 190 USDT
    // 4% admin   = 8 USDT
    // 1% executor= 2 USDT
    uint256 public constant ADMIN_PERCENT = 4;
    uint256 public constant EXECUTOR_PERCENT = 1;
    uint256 public constant PRIZE_PERCENT = 95;

    // Winner counts
    uint256 public constant GROUP_A_COUNT = 10;
    uint256 public constant GROUP_B_COUNT = 20;
    uint256 public constant GROUP_C_COUNT = 30;
    uint256 public constant GROUP_D_COUNT = 40;

    // Prize per ticket (USDT — 6 decimals)
    uint256 public constant GROUP_A_PRIZE = 5_850_000; // 5.85 USDT
    uint256 public constant GROUP_B_PRIZE = 2_925_000; // 2.925 USDT
    uint256 public constant GROUP_C_PRIZE = 1_300_000; // 1.30 USDT
    uint256 public constant GROUP_D_PRIZE =   975_000; // 0.975 USDT

    // =============================================================
    // STRUCTS
    // =============================================================

    struct Ticket {
        uint256 id;
        uint256 position;     // 1–100
        uint256 round;
        address owner;
        bool isWinner;
        uint8 winnerGroup;    // 1=A,2=B,3=C,4=D
        uint256 prize;        // USDT (6 decimals)
    }

    // =============================================================
    // STATE
    // =============================================================

    IERC20 public immutable usdtToken;
    address public admin;

    uint256 public currentRound = 1;
    uint256 public ticketsSold;
    uint256 public lastTicketId;

    bool public poolFilled;
    bool public winnersSelected;
    bool public drawInProgress;

    mapping(uint256 => Ticket) public tickets; // ticketId => Ticket
    mapping(uint256 => mapping(uint256 => address)) public ticketOwnerByRound; // round => position => owner
    mapping(uint256 => mapping(uint256 => uint256)) public positionToTicketId; // round => position => ticketId
    mapping(address => uint256[]) private userTicketIds;
    mapping(address => uint256) public claimableAmount;

    mapping(uint256 => uint256[]) public roundGroupAWinners;
    mapping(uint256 => uint256[]) public roundGroupBWinners;
    mapping(uint256 => uint256[]) public roundGroupCWinners;
    mapping(uint256 => uint256[]) public roundGroupDWinners;

    // =============================================================
    // EVENTS
    // =============================================================

    event TicketsPurchased(
        address indexed buyer,
        uint256[] ticketIds,
        uint256[] positions,
        uint256 quantity,
        uint256 totalCost,
        uint256 indexed round
    );

    event WinnersSelected(
        uint256 indexed round,
        uint256[] groupATicketIds,
        uint256[] groupBTicketIds,
        uint256[] groupCTicketIds,
        uint256[] groupDTicketIds,
        uint256 totalPrizePool
    );

    event TicketWon(
        uint256 indexed ticketId,
        uint256 indexed round,
        address indexed owner,
        uint8 group,
        uint256 prize
    );

    event PrizeClaimed(address indexed user, uint256 amount);
    event DrawExecuted(address indexed executor, uint256 indexed round, uint256 incentive);
    event RoundReset(address indexed executor, uint256 indexed round);

    // =============================================================
    // CONSTRUCTOR
    // =============================================================

    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT");
        usdtToken = IERC20(_usdtToken);
        admin = msg.sender;
    }

    // =============================================================
    // BUY TICKETS
    // =============================================================

    function buyTickets(uint256[] calldata positions) external nonReentrant whenNotPaused {
        require(!poolFilled, "Pool full");
        require(positions.length > 0, "No positions");
        require(ticketsSold + positions.length <= MAX_PARTICIPANTS, "Exceeds max");

        uint256 totalCost = positions.length * TICKET_PRICE;
        require(usdtToken.transferFrom(msg.sender, address(this), totalCost), "Transfer failed");

        uint256[] memory newTicketIds = new uint256[](positions.length);

        for (uint256 i = 0; i < positions.length; i++) {
            uint256 pos = positions[i];
            require(pos >= 1 && pos <= 100, "Invalid position");
            require(ticketOwnerByRound[currentRound][pos] == address(0), "Position taken");

            uint256 ticketId = ++lastTicketId;

            tickets[ticketId] = Ticket({
                id: ticketId,
                position: pos,
                round: currentRound,
                owner: msg.sender,
                isWinner: false,
                winnerGroup: 0,
                prize: 0
            });

            ticketOwnerByRound[currentRound][pos] = msg.sender;
            positionToTicketId[currentRound][pos] = ticketId;
            userTicketIds[msg.sender].push(ticketId);

            newTicketIds[i] = ticketId;
        }

        ticketsSold += positions.length;
        if (ticketsSold == MAX_PARTICIPANTS) poolFilled = true;

        emit TicketsPurchased(
            msg.sender,
            newTicketIds,
            positions,
            positions.length,
            totalCost,
            currentRound
        );
    }

    // =============================================================
    // DRAW
    // =============================================================

    function performDraw() external nonReentrant whenNotPaused {
        require(poolFilled, "Pool not full");
        require(!winnersSelected, "Already drawn");
        require(!drawInProgress, "Draw running");
        require(ticketsSold == MAX_PARTICIPANTS, "Incomplete round");

        drawInProgress = true;

        uint256 totalPool = MAX_PARTICIPANTS * TICKET_PRICE;
        uint256 adminFee = (totalPool * ADMIN_PERCENT) / 100;
        uint256 executorFee = (totalPool * EXECUTOR_PERCENT) / 100;
        uint256 prizePool = (totalPool * PRIZE_PERCENT) / 100;

        require(usdtToken.transfer(admin, adminFee), "Admin fee failed");
        require(usdtToken.transfer(msg.sender, executorFee), "Executor fee failed");

        uint256[] memory pool = new uint256[](100);
        for (uint256 pos = 1; pos <= 100; pos++) {
            uint256 tid = positionToTicketId[currentRound][pos];
            require(tid != 0, "Missing ticket");
            pool[pos - 1] = tid;
        }

        uint256 seed = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp, currentRound))
        );

        uint256 remaining = 100;

        _drawGroup(pool, seed, remaining, GROUP_A_COUNT, GROUP_A_PRIZE, 1, roundGroupAWinners[currentRound]);
        remaining -= GROUP_A_COUNT;

        _drawGroup(pool, seed, remaining, GROUP_B_COUNT, GROUP_B_PRIZE, 2, roundGroupBWinners[currentRound]);
        remaining -= GROUP_B_COUNT;

        _drawGroup(pool, seed, remaining, GROUP_C_COUNT, GROUP_C_PRIZE, 3, roundGroupCWinners[currentRound]);
        remaining -= GROUP_C_COUNT;

        _drawGroup(pool, seed, remaining, GROUP_D_COUNT, GROUP_D_PRIZE, 4, roundGroupDWinners[currentRound]);

        winnersSelected = true;
        drawInProgress = false;

        emit WinnersSelected(
            currentRound,
            roundGroupAWinners[currentRound],
            roundGroupBWinners[currentRound],
            roundGroupCWinners[currentRound],
            roundGroupDWinners[currentRound],
            prizePool
        );

        emit DrawExecuted(msg.sender, currentRound, executorFee);
    }

    function _drawGroup(
        uint256[] memory pool,
        uint256 seed,
        uint256 remaining,
        uint256 count,
        uint256 prize,
        uint8 group,
        uint256[] storage store
    ) internal {
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = uint256(keccak256(abi.encodePacked(seed, group, i))) % remaining;
            uint256 ticketId = pool[idx];

            store.push(ticketId);
            _markWinner(ticketId, group, prize);

            pool[idx] = pool[remaining - 1];
            remaining--;
        }
    }

    function _markWinner(uint256 ticketId, uint8 group, uint256 prize) internal {
        Ticket storage t = tickets[ticketId];
        t.isWinner = true;
        t.winnerGroup = group;
        t.prize = prize;

        claimableAmount[t.owner] += prize;

        emit TicketWon(ticketId, currentRound, t.owner, group, prize);
    }

    // =============================================================
    // CLAIM
    // =============================================================

    function claimPrize() external nonReentrant {
        uint256 amount = claimableAmount[msg.sender];
        require(amount > 0, "Nothing to claim");

        claimableAmount[msg.sender] = 0;
        require(usdtToken.transfer(msg.sender, amount), "Transfer failed");

        emit PrizeClaimed(msg.sender, amount);
    }

    // =============================================================
    // RESET
    // =============================================================

    function resetRound() external nonReentrant whenNotPaused {
        require(poolFilled && winnersSelected, "Round not finished");
        require(!drawInProgress, "Draw running");

        uint256 oldRound = currentRound;

        currentRound++;
        ticketsSold = 0;
        poolFilled = false;
        winnersSelected = false;

        emit RoundReset(msg.sender, oldRound);
    }

    // =============================================================
    // VIEWS
    // =============================================================

    function getUserTickets(address user) external view returns (uint256[] memory) {
        return userTicketIds[user];
    }

    function getTicketDetails(uint256 ticketId) external view returns (Ticket memory) {
        return tickets[ticketId];
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        uint256[] memory allTickets = userTicketIds[user];
        uint256 count = 0;

        for (uint256 i = 0; i < allTickets.length; i++) {
            if (tickets[allTickets[i]].round == currentRound) {
                count++;
            }
        }

        uint256[] memory positions = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allTickets.length; i++) {
            if (tickets[allTickets[i]].round == currentRound) {
                positions[idx] = tickets[allTickets[i]].position;
                idx++;
            }
        }

        return positions;
    }

    function getRoundWinners(uint256 round) external view returns (
        uint256[] memory groupA,
        uint256[] memory groupB,
        uint256[] memory groupC,
        uint256[] memory groupD
    ) {
        return (
            roundGroupAWinners[round],
            roundGroupBWinners[round],
            roundGroupCWinners[round],
            roundGroupDWinners[round]
        );
    }

    // =============================================================
    // ADMIN
    // =============================================================

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(usdtToken.transfer(owner(), amount), "Withdraw failed");
    }
}
#