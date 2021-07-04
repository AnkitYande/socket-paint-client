import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client"
import './App.css';

export default function Board(props) {

    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false)
    const [socket, setSocket] = useState(null)

    window.onpopstate = () => {
        if (socket) socket.disconnect();
    }

    const changeRoom = (room) => {
        if (socket && room) {
            socket.emit('join-room', room, (message) => {
                alert(message)
            })
        }
    }

    useEffect(() => {
        init();
        const socketTemp = io("http://localhost:3001", {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });
        setSocket(socketTemp)
    }, []);

    useEffect(() => {
        if (socket) {
            console.log("getting data")
            socket.on("canvas-data", (data) => {
                var img = new Image();
                img.src = data;
                if (ctx)
                    ctx.drawImage(img, 0, 0);
            })
        }
    }, [socket])

    useEffect(() => {
        if (props.room) changeRoom(props.room);
    }, [props.room]);

    useEffect(() => {
        if (ctx)
            ctx.lineWidth = props.size;
    }, [props.size, ctx])
    useEffect(() => {
        if (ctx)
            ctx.strokeStyle = props.color;
    }, [props.color, ctx])


    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        ctx.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();

        const base64Img = canvasRef.current.toDataURL("image/png")
        if (socket) {
            socket.emit("canvas-data", base64Img, props.room);
        }
    };

    const init = () => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.width = window.innerWidth * 0.9;
            canvas.height = window.innerHeight * 0.8;
            canvas.style.width = `${window.innerWidth * 0.9}px`;
            canvas.style.height = `${window.innerHeight * 0.8}px`;

            let context = canvas.getContext("2d");
            context.lineCap = "round";
            // context.scale(2,2);
            context.strokeStyle = props.color;
            context.lineWidth = props.size;
            setCtx(context);
        }
    }

    window.addEventListener('resize', init);

    return (
        <canvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            class="canvas"
        />
    )
}
