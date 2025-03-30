import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";

// Initialize Socket connection
const socket = 
// io("http://localhost:3001", {
io("https://socket-paint-server.onrender.com", {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

export default function Board({ room, size, color, buttonToggle }) {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    let lastX, lastY;

    // On Init
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            setupCanvas(canvas);
        }
    }, []);

    // On Room Change
    useEffect(() => {
        if (room) {
            socket.emit("join-room", room);
            clearCanvas();
            socket.emit("request-canvas", room);
        }
    }, [room]);

    // On Canvas Context Change
    useEffect(() => {
        const handleDrawData = ({ x, y, lastX, lastY, color, size }) => drawLine(lastX, lastY, x, y, color, size);
        const handleLoadCanvas = (dataUrl) => loadCanvas(dataUrl);
        const handleClearCanvas = () => clearCanvas();

        socket.on("draw-data", handleDrawData);
        socket.on("load-canvas", handleLoadCanvas);
        socket.on("clear-canvas", handleClearCanvas);

        return () => {
            socket.off("draw-data", handleDrawData);
            socket.off("load-canvas", handleLoadCanvas);
            socket.off("clear-canvas", handleClearCanvas);
        };
    }, [ctx]);

    // On Clear Btn Press
    useEffect(() => {
        if (ctx) {
            clearCanvas();
            socket.emit("clear-canvas", room);
        }
    }, [buttonToggle]);


    /*
     * Canvas Helper Functions
     */

    const setupCanvas = (canvas) => {
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.75;
        canvas.style.width = `${window.innerWidth * 0.8}px`;
        canvas.style.height = `${window.innerHeight * 0.75}px`;
        const context = canvas.getContext("2d");
        context.lineCap = "round";
        setCtx(context);
    };

    const drawLine = (x1, y1, x2, y2, strokeColor, lineWidth) => {
        if (!ctx) return;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    const loadCanvas = (dataUrl) => {
        if (!ctx) return;
        let img = new Image();
        img.src = dataUrl;
        img.onload = () => ctx.drawImage(img, 0, 0);
    };

    const clearCanvas = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };


    /*
    * Handles user drawing interactions:
    */
    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        lastX = offsetX;
        lastY = offsetY;
    };

    const finishDrawing = () => {
        setIsDrawing(false);
        socket.emit("save-canvas", { room, dataUrl: canvasRef.current.toDataURL("image/png") });
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        drawLine(lastX, lastY, offsetX, offsetY, color, size);
        socket.emit("draw-data", { x: offsetX, y: offsetY, lastX, lastY, color, size, room });
        lastX = offsetX;
        lastY = offsetY;
    };

    return (
        <canvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            className="canvas"
        />
    );
}
