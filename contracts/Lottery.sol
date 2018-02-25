pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;
    
    function Lottery() public {
        manager = msg.sender;
    }
    
    // 'payable' here means this method require Ether to be sent along while calling 
    //  this method. Received ether will be automatically stored in contract's balance.
    function enter() public payable {
        // Ensure that the caller send along > 0.01 Ether
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns(uint) {
        return uint(keccak256(block.difficulty, now, players));
    }

    function pickWinner() public restricted {
        // Winner's index = random() % players.length
        uint index = random() % players.length;
        // Transfer contract's balance into the winner's address
        players[index].transfer(this.balance);
        //Empty the players array to enter a new game
        players = new address[](0);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function getPlayers() public view returns(address[]) {
        return players;
    }
}
