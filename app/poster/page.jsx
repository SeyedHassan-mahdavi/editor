"use client"
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { fabric } from 'fabric';

const Poster = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('/Capture3.JPG'); // تصویر پیش‌فرض
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const canvasRef = useRef(null);

  // Function to create and display preview with Fabric.js
  const createPreview = () => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 700,
    });

    fabric.Image.fromURL(selectedTemplate, (img) => {
      img.set({ selectable: false });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

      // Adding text layers in specific positions
      const nameText = new fabric.Text(name, {
        left: 100,
        top: 200,
        fontSize: 30,
        fill: '#000',
      });
      const dateText = new fabric.Text(date, {
        left: 100,
        top: 250,
        fontSize: 20,
        fill: '#333',
      });
      const messageText = new fabric.Text(message, {
        left: 100,
        top: 300,
        fontSize: 25,
        fill: '#555',
      });

      canvas.add(nameText, dateText, messageText);
    });
  };

  // Function to download the final poster
  const downloadPoster = () => {
    html2canvas(canvasRef.current).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'poster.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>سفارشی‌سازی پوستر</h1>

      <label>انتخاب قالب:</label>
      <select onChange={(e) => setSelectedTemplate(e.target.value)}>
        <option value="/Capture3.JPG">قالب ۱</option>
        <option value="/Capture3.JPG">قالب ۲</option>
        <option value="/Capture3.JPG">قالب ۳</option>
      </select>

      <div style={{ margin: '20px 0' }}>
        <input
          type="text"
          placeholder="نام"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="تاریخ"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="پیام"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button onClick={createPreview}>پیش‌نمایش</button>
      <div
        ref={canvasRef}
        style={{
          border: '1px solid #ddd',
          margin: '20px auto',
          width: '500px',
          height: '700px',
        }}
      ></div>
      <button onClick={downloadPoster}>دانلود پوستر</button>
    </div>
  );
};

export default Poster;
