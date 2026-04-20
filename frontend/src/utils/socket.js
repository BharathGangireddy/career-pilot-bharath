import { io } from 'socket.io-client'

let socket = null

export const connectSocket = (token) => {
  socket = io('http://localhost:5000', {
    auth: { token }
  })

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected')
  })
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}