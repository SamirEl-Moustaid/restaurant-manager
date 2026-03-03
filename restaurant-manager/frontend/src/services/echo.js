import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

let echo = null

export const getEcho = () => {
  if (!echo) {
    echo = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
      forceTLS: true,
      authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      },
    })
  }
  return echo
}

export const subscribeToOrders = (callback) => {
  const echoInstance = getEcho()
  echoInstance.channel('orders').listen('.order.status.updated', callback)
  return () => echoInstance.leaveChannel('orders')
}

export const subscribeToKitchen = (callback) => {
  const echoInstance = getEcho()
  echoInstance.channel('kitchen').listen('.order.status.updated', callback)
  return () => echoInstance.leaveChannel('kitchen')
}
