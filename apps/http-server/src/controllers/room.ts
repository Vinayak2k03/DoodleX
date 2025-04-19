import { CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { Request, Response } from "express";

export const createRoom = async (req: Request, res: Response) => {
  try {
    // parse the request body
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
      res.status(400).json({
        message: "Invalid request",
      });
      return;
    }

    const safeParsedData = data.data;
    const userId = req.user;

    if (!userId) {
      res.status(400).json({
        message: "Invalid request",
      });
      return;
    }

    // check if the room already exists
    const existingRoom = await prismaClient.room.findUnique({
      where: {
        slug: safeParsedData.name,
      },
    });

    if (existingRoom) {
      res.status(400).json({
        message: "Room already exists",
      });
      return;
    }

    // creating the room
    const room = await prismaClient.room.create({
      data: {
        slug: safeParsedData.name,
        adminId: userId,
      },
    });

    console.log(room);

    res.status(201).json({
      message: "Room created successfully",
      roomId: room.id,
      room,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    console.log(err);
  }
};

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await prismaClient.room.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(rooms);

    res.status(200).json({
      message: "Rooms retrieved successfully",
      rooms,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    console.log(err);
  }
};

export const getRoom = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    if (!slug) {
      res.status(400).json({
        message: "Invalid request",
      });
      return;
    }

    const room = await prismaClient.room.findUnique({
      where: {
        slug: slug,
      },
    });

    if (!room) {
      res.status(400).json({
        message: "Room not found",
      });
      return;
    }

    res.status(200).json({
      message: "Room retrieved successfully",
      room,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
    });
    console.log(err);
  }
};

export const deleteRoom = async (req: Request, res: Response)=> {
  try {
    const { roomId } = req.body;
    const userId = req.user;

    if (!roomId || !userId) {
      res.status(400).json({
        message: "Invalid request",
      });
      return;
    }

    // Check if room exists and user is the admin
    const room = await prismaClient.room.findUnique({
      where: {
        id: Number(roomId),
      },
    });

    if (!room) {
      res.status(404).json({
        message: "Room not found",
      });
      return;
    }

    if (room.adminId !== userId) {
      res.status(403).json({
        message: "You don't have permission to delete this room",
      });
      return;
    }

    // Delete associated chats first
    await prismaClient.chat.deleteMany({
      where: {
        roomId: Number(roomId),
      },
    });

    // Delete room
    await prismaClient.room.delete({
      where: {
        id: Number(roomId),
      },
    });

    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
