pragma solidity 0.7.5;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockStakedToken is ERC20 {
    constructor() ERC20("StakedToken", "STK") {
        _mint(msg.sender, 10000000 ether);
    }

    function mint() external {
        _mint(msg.sender, 10000 ether);
    }
}
