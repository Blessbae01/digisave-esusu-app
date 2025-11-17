// In frontend/src/components/NotificationService.jsx (NEW FILE)

import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { io } from 'socket.io-client';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000'); // Connect to your backend

const NotificationService = () => {
    const userInfo = JSON.parse(localStorage.getItem('user'));
    
    useEffect(() => {
        if (userInfo && userInfo._id) {
            // 1. Tell the server who is connected
            socket.emit('userConnected', userInfo._id);
        }

        // 2. Listen for push notifications from the server
        socket.on('newNotification', (data) => {
            const { title, message, link } = data;
            
            // Display the toast notification popup
            toast.info(
                <div onClick={() => window.location.href = link}>
                    <strong>{title}</strong>
                    <p>{message}</p>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                }
            );
        });

        // Clean up socket listener on component unmount
        return () => {
            socket.off('newNotification');
        };
    }, [userInfo]);

    return (
        // ToastContainer is necessary to render the notifications
        <ToastContainer />
    );
};

export default NotificationService;