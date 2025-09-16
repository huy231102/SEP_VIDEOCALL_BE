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
      const { signal, to: callerId, name } = data;
      const calleeId = socket.id; // Người dùng trả lời cuộc gọi

      // Liên kết hai người dùng với nhau khi cuộc gọi được chấp nhận
      callMap[callerId] = calleeId;
      callMap[calleeId] = callerId;

      // Gửi lại cho người gọi cả signal và tên của người trả lời
      io.to(callerId).emit("callAccepted", { signal, name });
    });

    // Khi một người dùng chủ động kết thúc cuộc gọi
    socket.on("endCall", () => {
      const partnerId = callMap[socket.id];
      if (partnerId) {
        io.to(partnerId).emit("callEnded");
        delete callMap[socket.id];
        delete callMap[partnerId];
      }
    });

    // Nhận phụ đề từ một client và chuyển tiếp cho người còn lại
    socket.on("subtitle", (text) => {
      const partnerId = callMap[socket.id];
      console.log(`[Subtitle] từ ${socket.id} -> ${partnerId || 'null'}:`, text);
      if (partnerId) {
        io.to(partnerId).emit("subtitle", text);
      } else {
        console.warn(`[Subtitle] Không tìm thấy partner cho ${socket.id}. callMap:`, callMap);
      }
    });
  });
};

module.exports = socketHandler; 