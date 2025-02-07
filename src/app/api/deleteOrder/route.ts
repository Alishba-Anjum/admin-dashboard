// app/api/deleteOrder/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

export async function DELETE(request: Request) {
  const { orderId } = await request.json();
  if (!orderId) {
    return NextResponse.json({ message: "Order ID is required" }, { status: 400 });
  }

  try {
    const result = await client.delete(orderId);
    return NextResponse.json({ message: "Order deleted successfully", result }, { status: 200 });
  } catch (error: any) {
    console.error("Error in API route while deleting order:", error);
    return NextResponse.json(
      { message: "Failed to delete order", error: error.message },
      { status: 500 }
    );
  }
}
