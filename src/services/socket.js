const socketHandler = (io) => {
  // Sử dụng một map để theo dõi xem ai đang gọi ai
  const callMap = {};

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Người dùng đã kết nối: ${socket.id}`);
    socket.emit("me", socket.id);

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Người dùng đã ngắt kết nối: ${socket.id}`);
      // Tìm người đang trong cuộc gọi với người dùng vừa ngắt kết nối
      const partnerId = callMap[socket.id];
      if (partnerId) {
        // Chỉ thông báo cho người đó rằng cuộc gọi đã kết thúc
        io.to(partnerId).emit("callEnded");
        // Xóa thông tin cuộc gọi khỏi map
        delete callMap[socket.id];
        delete callMap[partnerId];
      }
    });

    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
      io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });

    socket.on("answerCall", (data) => {
      const callerId = data.to;
      const calleeId = socket.id; // Người dùng trả lời cuộc gọi

      // Liên kết hai người dùng với nhau khi cuộc gọi được chấp nhận
      callMap[callerId] = calleeId;
      callMap[calleeId] = callerId;

      io.to(callerId).emit("callAccepted", data.signal);
    });
  });
};

module.exports = socketHandler; 