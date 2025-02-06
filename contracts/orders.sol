// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract NemoOrders is Ownable {
    struct Order {
        address customer;
        uint256 amountPaid;
        string pickupLocation;
        string dropoffLocation;
        bool completed;
    }

    Order[] public orders;
    mapping(uint256 => address) public assignedRobots;

    event OrderPlaced(uint256 indexed orderId, address indexed customer, uint256 amount, string pickup, string dropoff);
    event OrderAssigned(uint256 indexed orderId, address indexed robot);
    event OrderCompleted(uint256 indexed orderId, address indexed robot);

    constructor() Ownable(msg.sender) {}

    // Customers place orders by sending ETH
    function placeOrder(string memory pickup, string memory dropoff) public payable {
        require(msg.value > 0, "Must pay to create order");

        orders.push(Order(msg.sender, msg.value, pickup, dropoff, false));
        emit OrderPlaced(orders.length - 1, msg.sender, msg.value, pickup, dropoff);
    }

    // Assign an order to a robot
    function assignOrder(uint256 orderId, address robot) public onlyOwner {
        require(orderId < orders.length, "Invalid order");
        require(assignedRobots[orderId] == address(0), "Order already assigned");

        assignedRobots[orderId] = robot;
        emit OrderAssigned(orderId, robot);
    }

    // Mark order as completed and pay the robot
    function completeOrder(uint256 orderId) public {
        require(orderId < orders.length, "Invalid order");
        require(assignedRobots[orderId] == msg.sender, "Not assigned robot");
        require(!orders[orderId].completed, "Order already completed");

        orders[orderId].completed = true;
        payable(msg.sender).transfer(orders[orderId].amountPaid);

        emit OrderCompleted(orderId, msg.sender);
    }

    // Retrieve all orders
    function getOrders() public view returns (Order[] memory) {
        return orders;
    }
}
