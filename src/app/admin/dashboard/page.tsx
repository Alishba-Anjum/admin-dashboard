"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Swal from "sweetalert2";
import ProtectedRoute from "../../../components/ProtectedRoute";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  total: number;
  discount: number;
  orderDate: string;
  status: string | null;
  cartItems: { productName: string; image: string }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [filter, setFilter] = useState("All");

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          total,
          discount,
          orderDate,
          status,
          cartItems[]->{
            productName,
            image
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  
  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "Your order has been deleted.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client
        .patch(orderId)
        .set({ status: newStatus })
        .commit();
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Swal.fire("Updated!", `Order status changed to ${newStatus}.`, "success");
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Something went wrong while updating the status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-yellow-100 gap-6 p-4 md:p-6">
        <nav className="bg-yellow-700 text-white p-4 shadow-lg flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <div className="flex space-x-2 mt-2 md:mt-0">
            {["All", "pending", "dispatch", "success"].map((status) => (
              <button
                key={status}
                className={`px-3 py-1 text-sm md:text-base rounded-lg transition-all ${
                  filter === status ? "bg-white text-yellow-900 font-bold" : "text-white"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        <div className="overflow-x-auto bg-gray-50 text-yellow-900 shadow-lg rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4 text-center text-yellow-900">Orders Details</h2>
          <table className="w-full text-sm md:text-base">
            <thead className="bg-yellow-200 text-yellow-800">
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
  {filteredOrders.map((order) => (
    <React.Fragment key={order._id}>
      <tr
        className="cursor-pointer hover:bg-yellow-100 transition-all"
        
      >
        <td className="px-4 py-2 text-center">{order._id}</td>
        <td className="px-4 py-2">{order.firstName} {order.lastName}</td>
        <td className="px-4 py-2">{order.address}</td>
        <td className="px-4 py-2">{new Date(order.orderDate).toLocaleDateString()}</td>
        <td className="px-4 py-2">${order.total}</td>
        <td className="px-4 py-2">
          <select
            value={order.status || ""}
            onChange={(e) => handleStatusChange(order._id, e.target.value)}
            className="bg-gray-100 p-1 rounded"
          >
            <option value="pending">Pending</option>
            <option value="dispatch">Dispatch</option>
            <option value="success">Completed</option>
          </select>
        </td>
        <td className="px-4 py-2 text-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(order._id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </td>
      </tr>

      {/* Order Details Row */}
      {selectedOrderId === order._id && (
        <tr>
          <td colSpan={7} className="p-4 bg-yellow-50">
            <h3 className="text-lg font-semibold">Order Items:</h3>
            <ul className="list-disc pl-5">
              {order.cartItems.map((item, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover" />
                  {item.productName}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
