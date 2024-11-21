'use client';

import { Stage, Layer, Rect, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import { ChevronDownIcon, ChevronUpIcon, EllipsisHorizontalIcon, EyeIcon, EyeSlashIcon, LockClosedIcon, LockOpenIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState, useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import { useParams, useRouter } from 'next/navigation';
import { jsPDF } from "jspdf";
import { PuffLoader } from "react-spinners";
import templates from "../../../templates.json";
import { useForm } from "../../context/FormContext";
import LayerPositionViewer from "../../components/LayerPositionViewer";




export default function Editor() {
    const [isDownloading, setIsDownloading] = useState(false);
    const [layers, setLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [editingText, setEditingText] = useState(false);
    const [textEditValue, setTextEditValue] = useState("");
    const [tempColor, setTempColor] = useState(null);
    const [templateSize, setTemplateSize] = useState({ width: 1080, height: 1920 });
    const [templateDpi, setTemplateDpi] = useState(300);
    const { templateId } = useParams();
    const router = useRouter();
    const transformerRef = useRef();
    const layerRefs = useRef({});
    const [exportFormat, setExportFormat] = useState("png"); // فرمت پیش‌فرض
    const [toolbarPosition, setToolbarPosition] = useState(null); // موقعیت نوار ابزار
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [activeSidebar, setActiveSidebar] = useState("templates"); // انتخاب بین قالب‌ها یا ابزارها
    const [sidebarView, setSidebarView] = useState("DefaultView"); // حالت پیش‌فرض
    const { formData } = useForm();
    const [backgroundColor, setBackgroundColor] = useState("#ffffff"); // پیش‌فرض سفید
    const [selectedFont, setSelectedFont] = useState("");
    const [favorites, setFavorites] = useState([]);
    const [myFonts, setMyFonts] = useState([]);
    const [fontSearchQuery, setFontSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    // دریافت اندازه صفحه
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    const [zoomScale, setZoomScale] = useState(1); // مقدار اولیه 1
    const [position, setPosition] = useState({ x: 0, y: 0 }); // موقعیت اولیه
    const [isDraggingLayer, setIsDraggingLayer] = useState(false);


    const fonts = [
        { name: "IranNastaliq", customName: "ایران نستعلیق" },
        { name: "persian-kereshmeh", customName: "کرشمه" },
        { name: "Suls", customName: "ثلث" },
        { name: "PERSIAN-ENTEZAR", customName: "انتظار" },
        { name: "Far_Nazanin", customName: "نازنین" },
        { name: "Far_khodkar", customName: "خودکار" },
        { name: "danstevis", customName: "دست نویس" },
        { name: "B Mitra_0", customName: "میترا" },
        { name: "+ Badr_p30download.com", customName: "بدر" },
        { name: "Parastoo-Bold", customName: "پرستو (ضخیم)" },
        { name: "Parastoo", customName: "پرستو" },
        { name: "GoftehWeb-Heavy", customName: "گفته" },
        { name: "Doran-Thin", customName: "Doran-Thin" },
        { name: "Doran-Bold", customName: "Doran-Bold" },
        { name: "Doran-Light", customName: "Doran-Light" },
        { name: "KalamehWeb_Regular", customName: "KalamehWeb_Regular" },
        { name: "KalamehWeb_Black", customName: "KalamehWeb_Black" },
        { name: "KalamehWeb_Bold", customName: "KalamehWeb_Bold" },
        { name: "PeydaWeb-Black", customName: "PeydaWeb-Black" },
        { name: "PeydaWeb-Bold", customName: "PeydaWeb-Bold" },
        { name: "PeydaWeb-Medium", customName: "PeydaWeb-Medium" },
    ];
const HEADER_HEIGHT = 50; // ارتفاع هدر ثابت
const FOOTER_MARGIN = 50; // فاصله پایین


useEffect(() => {
    const calculateCenterPosition = () => {
        const isMobile = window.innerWidth <= 768; // بررسی اندازه نمایشگر برای موبایل
        const stageWidth = isMobile ? window.innerWidth : containerWidth * 0.7; // 100% برای موبایل، 70% برای دسکتاپ
        const stageHeight = window.innerHeight - HEADER_HEIGHT - FOOTER_MARGIN; // کم کردن ارتفاع هدر و فاصله پایین

        const scaleFactor = Math.min(
            stageWidth / templateSize.width,
            stageHeight / templateSize.height
        );

        const centerX = (stageWidth - templateSize.width * scaleFactor) / 2;
        const centerY = (stageHeight - templateSize.height * scaleFactor) / 2 + HEADER_HEIGHT; // اضافه کردن HEADER_HEIGHT به مرکز عمودی

        setZoomScale(scaleFactor);
        setPosition({ x: centerX, y: centerY });
    };

    calculateCenterPosition();
    window.addEventListener("resize", calculateCenterPosition);
    return () => window.removeEventListener("resize", calculateCenterPosition);
}, [containerWidth, containerHeight, templateSize]);


    const filteredFonts = fonts
        .filter((font) =>
            activeTab === "favorites"
                ? favorites.includes(font.name)
                : true
        )
        .filter((font) =>
            font.name.toLowerCase().includes(fontSearchQuery.toLowerCase()) ||
            font.customName?.includes(fontSearchQuery) // بررسی نام فارسی
        );


    const toggleFavorite = (fontName) => {
        setFavorites((prev) =>
            prev.includes(fontName)
                ? prev.filter((name) => name !== fontName)
                : [...prev, fontName]
        );
    };

    const handleFontUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newFontName = file.name.replace(/\.[^/.]+$/, ""); // نام بدون پسوند
            setMyFonts((prev) => [...prev, newFontName]);
        }
    };

    const handleZoom = (e) => {
        e.evt.preventDefault();

        const stage = e.target.getStage();
        const scaleBy = 1.2;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        // محدود کردن زوم
        // newScale = Math.max(0.5, Math.min(5, newScale));

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        stage.batchDraw();

        setZoomScale(newScale);
        setPosition(newPos);
    };


    const handleDragEnd = (e) => {
        const stage = e.target.getStage();
        const newPos = stage.position();

        // ذخیره موقعیت جدید
        setPosition(newPos);
    };




    useEffect(() => {
        if (transformerRef.current) {
            if (selectedLayer) {
                const selectedNode = layerRefs.current[selectedLayer];
                if (selectedNode && !layers.find((layer) => layer.id === selectedLayer)?.hidden) {
                    transformerRef.current.nodes([selectedNode]);
                    transformerRef.current.getLayer().batchDraw();
                } else {
                    // اگر لایه مخفی بود
                    transformerRef.current.nodes([]);
                    transformerRef.current.getLayer().batchDraw();
                }
            } else {
                // اگر هیچ لایه‌ای انتخاب نشده بود
                transformerRef.current.nodes([]);
            }
        }
    }, [selectedLayer, layers]);

    useEffect(() => {
        console.log("Template ID: ", templateId);

        const template = templates.find((t) => t.id === templateId);

        if (!template) {
            router.push("/templates");
            return;
        }

        const loadTemplate = async () => {
            const loadedLayers = await Promise.all(
                template.layers.map(async (layer) => {
                    if (layer.type === "image") {
                        return new Promise((resolve) => {
                            const img = new window.Image();
                            img.src = layer.src;
                            img.onload = () => {
                                resolve({ ...layer, image: img });
                            };
                        });
                    }

                    if (layer.type === "text") {
                        // پیدا کردن کلید مناسب از preFillFields
                        const preFillField = template.preFillFields?.find(
                            (field) => field.label === layer.text // بررسی ارتباط label و متن پیش‌فرض
                        );

                        return {
                            ...layer,
                            // استفاده از مقدار formData یا متن پیش‌فرض
                            text: preFillField && formData[preFillField.field]
                                ? formData[preFillField.field]
                                : layer.text,
                            fill: layer.fill || "#000000", // تنظیم رنگ پیش‌فرض یا رنگ تعریف‌شده در قالب
                            fontFamily: layer.fontFamily || "Arial" // اعمال فونت پیش‌فرض یا مشخص‌شده
                        };

                    }

                    return layer; // سایر لایه‌ها بدون تغییر
                })
            );

            console.log("Loaded Layers: ", loadedLayers);
            console.log("Loaded Layers: ", formData);

            setLayers(loadedLayers);
            setTemplateSize(template.size); // تنظیم اندازه قالب
            setTemplateDpi(template.dpi); // تنظیم DPI قالب
        };

        loadTemplate();
    }, [templateId, formData, router]);


    const handleLayerSelect = (layer) => {
        setSelectedLayer(layer.id); // انتخاب لایه
        const node = layerRefs.current[layer.id];
        if (node) {
            const box = node.getClientRect(); // گرفتن موقعیت لایه
            const stage = transformerRef.current.getStage(); // گرفتن بوم اصلی
            const stageBox = stage.container().getBoundingClientRect(); // موقعیت بوم در صفحه

            // محاسبه موقعیت نوار ابزار
            setToolbarPosition({
                x: stageBox.left + box.x + box.width / 2, // ترکیب موقعیت لایه و بوم
                y: stageBox.top + box.y + box.height + 150,
            });
        }
    };

    const closeToolbar = () => {
        setToolbarPosition(null);
        setShowMoreMenu(false);
        setSelectedLayer(null);
    };
    // Save the current state to history
    const saveHistory = (newLayers) => {
        const newHistory = [...history.slice(0, historyIndex + 1), newLayers];
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Add new layer
    const addLayer = (type) => {
        const newLayer = {
            id: Date.now(),
            type,
            rotation: 0, // چرخش پیش‌فرض
            x: 50,
            y: 50,
            width: type === 'rect' ? 100 : undefined,
            height: type === 'rect' ? 100 : undefined,
            text: type === 'text' ? 'Sample Text' : undefined,
            fill: type === 'rect' ? '#cccccc' : '#000000',
            locked: false,
            hidden: false,
        };
        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        saveHistory(newLayers);

        if (type === 'text') {
            setSelectedLayer(newLayer.id); // انتخاب لایه جدید
            setTextEditValue(newLayer.text || ""); // مقدارگذاری اولیه متن
            setSidebarView("editText"); // باز کردن گزینه ویرایش
            setEditingText(true); // فعال کردن حالت ویرایش
        }
    };

    // Delete selected layer
    const deleteLayer = () => {
        if (selectedLayer !== null) {
            const newLayers = layers.filter((layer) => layer.id !== selectedLayer);
            setLayers(newLayers);
            setSelectedLayer(null);
            saveHistory(newLayers);
        }
    };

    // Update properties of a layer
    const updateLayer = (id, updates) => {
        const newLayers = layers.map((layer) =>
            layer.id === id ? { ...layer, ...updates } : layer
        );
        setLayers(newLayers);
        saveHistory(newLayers);
    };

    // Select a layer
    const selectLayer = (id) => {
        setSelectedLayer(id);
    };

    // Bring a layer to the front
    const bringToFront = () => {
        if (!selectedLayer) return;
        const index = layers.findIndex((layer) => layer.id === selectedLayer);
        const newLayers = [...layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.push(layer);
        setLayers(newLayers);
        saveHistory(newLayers);
    };

    // Send a layer to the back
    const sendToBack = () => {
        if (!selectedLayer) return;
        const index = layers.findIndex((layer) => layer.id === selectedLayer);
        const newLayers = [...layers];
        const [layer] = newLayers.splice(index, 1);
        newLayers.unshift(layer);
        setLayers(newLayers);
        saveHistory(newLayers);
    };

    // Undo action
    const undo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setLayers(history[historyIndex - 1]);
        }
    };

    // Redo action
    const redo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setLayers(history[historyIndex + 1]);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = new window.Image();
            img.src = reader.result;
            img.onload = () => {
                const newLayer = {
                    id: Date.now(),
                    type: 'image',
                    x: 50,
                    y: 50,
                    image: img,
                    width: img.width / 2,
                    height: img.height / 2,
                    locked: false,
                    hidden: false,
                };
                const newLayers = [...layers, newLayer];
                setLayers(newLayers);
                saveHistory(newLayers);
            };
        };
        reader.readAsDataURL(file);
    };

    const handleEditButtonClick = () => {
        const selectedTextLayer = layers.find(
            (layer) => layer.id === selectedLayer && layer.type === "text"
        );
        if (selectedTextLayer) {
            setTextEditValue(selectedTextLayer.text); // مقدار فعلی متن
            setEditingText(true); // فعال کردن حالت ویرایش
        }
    };


    const handleTextSave = () => {
        const updatedLayers = layers.map((layer) =>
            layer.id === selectedLayer ? { ...layer, text: textEditValue } : layer
        );
        setLayers(updatedLayers);
        saveHistory(updatedLayers); // افزودن به تاریخچه
        setEditingText(false); // بستن حالت ویرایش
        setTextEditValue(""); // پاک کردن مقدار
        setSidebarView("DefaultView")
    };


    const handleLayerClick = (id) => {
        setSelectedLayer(id);
    };

    const handleDownload = async () => {
        setIsDownloading(true);
        await new Promise((resolve) => setTimeout(resolve, 100)); // کمی صبر برای نمایش لودر

        const scale = templateDpi / 96; // مقیاس برای DPI مشخص شده
        const stage = transformerRef.current.getStage();

        // ایجاد یک بوم پنهان
        const hiddenContainer = document.createElement("div");
        hiddenContainer.style.position = "absolute";
        hiddenContainer.style.top = "-9999px"; // خارج از دید کاربر
        document.body.appendChild(hiddenContainer);

        const hiddenStage = stage.clone({
            container: hiddenContainer, // بوم مخفی
        });

        // تنظیم اندازه و مقیاس برای hiddenStage
        hiddenStage.width(templateSize.width * scale);
        hiddenStage.height(templateSize.height * scale);
        hiddenStage.scale({ x: scale, y: scale });
        hiddenStage.position({ x: 0, y: 0 });

        // مخفی کردن خط‌چین دور بوم
        const borderRect = hiddenStage.findOne((node) => node.getClassName() === "Rect" && node.attrs.dash);
        if (borderRect) {
            borderRect.visible(false);
        }

        // اضافه کردن پس‌زمینه سفید برای فرمت‌های غیر PNG
        if (exportFormat !== "png") {
            const backgroundLayer = new Konva.Layer();
            const backgroundRect = new Konva.Rect({
                x: 0,
                y: 0,
                width: hiddenStage.width(),
                height: hiddenStage.height(),
                fill: backgroundColor,
                listening: false, // غیرفعال کردن تعامل با لایه
            });
            backgroundLayer.add(backgroundRect);
            hiddenStage.add(backgroundLayer);
            backgroundLayer.moveToBottom(); // انتقال پس‌زمینه به لایه زیرین
        }

        hiddenStage.batchDraw(); // بازسازی صحنه

        // فرآیند خروجی
        if (exportFormat === "png" || exportFormat === "jpeg") {
            const dataURL = hiddenStage.toDataURL({ pixelRatio: scale });
            const link = document.createElement("a");
            link.download = `canvas.${exportFormat}`;
            link.href = dataURL;
            link.click();
        } else if (exportFormat === "svg") {
            const svg = hiddenStage.toDataURL({ mimeType: "image/svg+xml" });
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.download = "canvas.svg";
            link.href = URL.createObjectURL(blob);
            link.click();
        } else if (exportFormat === "pdf") {
            const pdf = new jsPDF("p", "pt", [
                templateSize.width * (templateDpi / 72),
                templateSize.height * (templateDpi / 72),
            ]);
            pdf.addImage(
                hiddenStage.toDataURL({ pixelRatio: scale }),
                "JPEG",
                0,
                0,
                templateSize.width * (templateDpi / 72),
                templateSize.height * (templateDpi / 72)
            );
            pdf.save("canvas.pdf");
        }

        // تمیز کردن
        hiddenStage.destroy(); // حذف بوم مخفی
        document.body.removeChild(hiddenContainer); // حذف از DOM
        setIsDownloading(false);
    };



    return (
        <div className="flex  h-screen overflow-hidden ">
            <header className="hidden lg:flex fixed top-0 left-0 w-full bg-gray-800 text-white z-50 shadow-lg">
                <div className="container h-16 bg-gray-900 flex items-center justify-center px-6">
                    {/* متن و تنظیمات لایه‌های انتخاب‌شده */}
                    {selectedLayer &&
                        layers.find((layer) => layer.id === selectedLayer)?.type === "text" && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        setSidebarView("editText");
                                        handleEditButtonClick();
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                >
                                    ویرایش متن
                                </button>

                                <div className="flex items-center gap-4">
                                    <div>
                                        <button
                                            onClick={() => setSidebarView("colorPicker")}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        >
                                            رنگ
                                        </button>
                                    </div>
                                    {/* فوت قدیم */}
                                    {/* <div>
                                        <label className="block text-sm font-medium">فونت:</label>
                                        <select
                                            className="border rounded-lg px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={layers.find((layer) => layer.id === selectedLayer)?.fontFamily || "Arial"}
                                            onChange={(e) => updateLayer(selectedLayer, { fontFamily: e.target.value })}
                                        >
                                            <option value="IranNastaliq">ایران نستعلیق</option>
                                            <option value="persian-kereshmeh">کرشمه</option>
                                            <option value="Suls">ثلث</option>
                                            <option value="PERSIAN-ENTEZAR">انتظار</option>
                                            <option value="Far_Nazanin">نازنین</option>
                                            <option value="Far_khodkar">خودکار</option>
                                            <option value="danstevis">دست نویس</option>
                                            <option value="B Mitra_0">میترا</option>
                                            <option value="+ Badr_p30download.com">بدر</option>
                                            <option value="Parastoo-Bold">پرستو (ضخیم)</option>
                                            <option value="Parastoo">پرستو</option>
                                            <option value="GoftehWeb-Heavy">گفته</option>
                                            <option value="Doran-Thin">Doran-Thin</option>
                                            <option value="Doran-Bold">Doran-Bold</option>
                                            <option value="Doran-Light">Doran-Light</option>
                                            <option value="KalamehWeb_Regular">KalamehWeb_Regular</option>
                                            <option value="KalamehWeb_Black">KalamehWeb_Black</option>
                                            <option value="KalamehWeb_Bold">KalamehWeb_Bold</option>
                                            <option value="PeydaWeb-Black">PeydaWeb-Black</option>
                                            <option value="PeydaWeb-Bold">PeydaWeb-Bold</option>
                                            <option value="PeydaWeb-Medium">PeydaWeb-Medium</option>
                                        </select>

                                    </div> */}

                                    <div>
                                        <label className="block text-sm font-medium">فونت :</label>
                                        <button
                                            onClick={() => setSidebarView("fontPicker")}
                                            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2"
                                        >
                                            <span
                                                style={{
                                                    fontFamily: layers.find((layer) => layer.id === selectedLayer)?.fontFamily || "Arial",
                                                }}
                                            >
                                                {fonts.find(
                                                    (font) =>
                                                        font.name === layers.find((layer) => layer.id === selectedLayer)?.fontFamily
                                                )?.customName || "فونت پیش‌فرض"}
                                            </span>

                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">اندازه فونت (pt):</label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded-lg transition-all"
                                                onClick={() =>
                                                    updateLayer(selectedLayer, {
                                                        fontSize: Math.max(
                                                            1,
                                                            (layers.find((layer) => layer.id === selectedLayer)?.fontSize || 16) / 1.33 - 1 // تبدیل به pt و کم کردن
                                                        ) * 1.33 // تبدیل مجدد به px
                                                    })
                                                }
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 border rounded-lg px-2 py-1 bg-gray-700 text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={
                                                    Math.round((layers.find((layer) => layer.id === selectedLayer)?.fontSize || 16) / 1.33)
                                                } // تبدیل px به pt
                                                onChange={(e) =>
                                                    updateLayer(selectedLayer, {
                                                        fontSize: Math.max(1, parseInt(e.target.value, 10) || 1) * 1.33, // تبدیل pt به px
                                                    })
                                                }
                                            />
                                            <button
                                                className="bg-gray-700 hover:bg-gray-800 text-white px-2 py-1 rounded-lg transition-all"
                                                onClick={() =>
                                                    updateLayer(selectedLayer, {
                                                        fontSize:
                                                            ((layers.find((layer) => layer.id === selectedLayer)?.fontSize || 16) / 1.33 + 1) * 1.33, // افزایش pt و تبدیل به px
                                                    })
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">فاصله خطوط:</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-20 border rounded-lg px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={layers.find((layer) => layer.id === selectedLayer)?.lineHeight || 1.2}
                                            onChange={(e) =>
                                                updateLayer(selectedLayer, { lineHeight: parseFloat(e.target.value) })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">استایل:</label>
                                        <select
                                            className="border rounded-lg px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={layers.find((layer) => layer.id === selectedLayer)?.fontStyle || "normal"}
                                            onChange={(e) => updateLayer(selectedLayer, { fontStyle: e.target.value })}
                                        >
                                            <option value="normal">معمولی</option>
                                            <option value="bold">ضخیم</option>
                                            <option value="italic">مورب</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">تزیین متن:</label>
                                        <select
                                            className="border rounded-lg px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={layers.find((layer) => layer.id === selectedLayer)?.textDecoration || "none"}
                                            onChange={(e) => updateLayer(selectedLayer, { textDecoration: e.target.value })}
                                        >
                                            <option value="none">هیچ</option>
                                            <option value="underline">خط زیر</option>
                                            <option value="line-through">خط روی متن</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}


                    {selectedLayer &&
                        layers.find((layer) => layer.id === selectedLayer)?.type === "image" && (
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium">شفافیت:</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        className="w-32"
                                        value={layers.find((layer) => layer.id === selectedLayer)?.opacity || 1}
                                        onChange={(e) => updateLayer(selectedLayer, { opacity: parseFloat(e.target.value) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">رنگ سایه:</label>
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded-full"
                                        value={layers.find((layer) => layer.id === selectedLayer)?.shadowColor || "#000000"}
                                        onChange={(e) => updateLayer(selectedLayer, { shadowColor: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">میزان تاری:</label>
                                    <input
                                        type="number"
                                        className="w-20 border rounded-lg px-2 py-1 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={layers.find((layer) => layer.id === selectedLayer)?.shadowBlur || 0}
                                        onChange={(e) => updateLayer(selectedLayer, { shadowBlur: parseInt(e.target.value, 10) })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium">شدت سایه:</label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.1"
                                        className="w-32"
                                        value={layers.find((layer) => layer.id === selectedLayer)?.shadowOpacity || 1}
                                        onChange={(e) =>
                                            updateLayer(selectedLayer, { shadowOpacity: parseFloat(e.target.value) })
                                        }
                                    />
                                </div>
                            </div>
                        )}
                </div>
            </header>



            {isDownloading && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                    <PuffLoader color="#4A90E2" size={100} />
                </div>
            )}



            <div className="flex flex-row flex-1 ">
                {/* Sidebar */}
                <div className=" hidden lg:flex w-1/3 z-50 mt-16 bg-gray-900 text-white  flex-row">
                    {/* بخش کوچک */}
                    <div className="w-1/3 bg-gray-800 p-4 flex flex-col items-center justify-between">
                        <div className=" bg-gray-900 text-white p-4 shadow-lg h-screen flex flex-col">
                            {/* دکمه‌های ناوبری */}
                            <div className="space-y-4">
                                <button
                                    className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all ${activeSidebar === "DefaultView"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                    onClick={() => setSidebarView("DefaultView")}                        >
                                    قالب‌ها
                                </button>
                                <button
                                    className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all ${activeSidebar === "DefaultView"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                    onClick={() => setSidebarView("DefaultView")}
                                >
                                    ابزارها
                                </button>
                                <button
                                    className={`w-full py-3 px-6 rounded-lg text-lg font-semibold transition-all ${activeSidebar === "layers"
                                        ? "bg-yellow-600 hover:bg-yellow-700"
                                        : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                    onClick={() => setSidebarView("layers")}
                                >
                                    لایه‌ها
                                </button>
                            </div>

                            {/* تنظیمات خروجی */}
                            <div className="mt-8 border-t border-gray-600 pt-4">
                                <h3 className="text-lg font-bold text-gray-300 mb-2">فرمت خروجی</h3>
                                <div className="flex items-center space-x-3">
                                    <label htmlFor="exportFormat" className="font-medium">
                                        انتخاب فرمت:
                                    </label>
                                    <select
                                        id="exportFormat"
                                        className="p-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onChange={(e) => setExportFormat(e.target.value)}
                                    >
                                        <option value="png">PNG</option>
                                        <option value="jpeg">JPEG</option>
                                        <option value="svg">SVG</option>
                                        <option value="pdf">PDF</option>
                                    </select>
                                </div>
                                <button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6 transition-all"
                                    onClick={() => handleDownload()}
                                >
                                    دانلود
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* بخش بزرگ */}
                    <div className="w-2/3 bg-gray-700 p-6 overflow-y-auto">

                        {/* <button
                        className="bg-red-500 text-white rounded-md px-4 py-2 mb-3 hover:bg-red-600"
                        onClick={deleteLayer}
                    >
                        Delete Selected
                    </button>
                    <button
                        className="bg-yellow-500 text-white rounded-md px-4 py-2 mb-3 hover:bg-yellow-600"
                        onClick={bringToFront}
                    >
                        Bring to Front
                    </button>
                    <button
                        className="bg-purple-500 text-white rounded-md px-4 py-2 mb-3 hover:bg-purple-600"
                        onClick={sendToBack}
                    >
                        Send to Back
                    </button> */}



                        {/* <h2 className="text-md font-semibold text-gray-600 mb-2">Templates</h2>
                    <div className="space-y-2">
                        {templates.map((template) => (
                            <button
                                key={template.id}
                                className="bg-teal-500 text-white rounded-md px-4 py-2 mb-3 hover:bg-teal-600"
                                onClick={() => applyTemplate(template)}
                            >
                                {template.name}
                            </button>
                        ))}
                    </div> */}
                        {/* سایدبار پیش فرض */}
                        {sidebarView === "DefaultView" && (
                            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-6">
                                <div className="flex flex-col gap-4">
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        onClick={() => addLayer("rect")}
                                    >
                                        ➕ افزودن مستطیل
                                    </button>

                                    <button
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        onClick={() => addLayer("text")}
                                    >
                                        ✏️ افزودن متن
                                    </button>
                                    <button
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        onClick={() => setSidebarView("backgroundPicker")}
                                    >
                                        🎨 تغییر پس‌زمینه
                                    </button>
                                    <LayerPositionViewer layers={layers} selectedLayer={selectedLayer} />


                                    <div>
                                        <h2 className="text-md font-semibold text-gray-100 mb-2">🖼 افزودن تصویر</h2>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-gray-100 px-2 py-1 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={(e) => handleImageUpload(e)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        onClick={undo}
                                        disabled={historyIndex <= 0}
                                    >
                                        ⬅️ بازگشت
                                    </button>
                                    <button
                                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                        onClick={redo}
                                        disabled={historyIndex >= history.length - 1}
                                    >
                                        ➡️ پیش‌روی
                                    </button>
                                </div>

                                <div className="mt-8">
                                    <h2 className="text-md font-semibold text-gray-100 mb-4">📂 لایه‌ها</h2>
                                    <ul className="space-y-3">
                                        {layers.map((layer) => (
                                            <li
                                                key={layer.id}
                                                className={`flex items-center justify-between p-3 rounded-lg shadow-md border transition-all duration-300 cursor-pointer ${selectedLayer === layer.id
                                                    ? "border-blue-500 bg-gray-700"
                                                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                                                    }`}
                                                onClick={() => selectLayer(layer.id)}
                                            >
                                                {/* کنترل نمایش و قفل */}
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLayer(layer.id, { hidden: !layer.hidden });
                                                        }}
                                                        className={`p-2 rounded-full shadow ${layer.hidden
                                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                                            : "bg-green-500 hover:bg-green-600 text-white"
                                                            }`}
                                                    >
                                                        {layer.hidden ? (
                                                            <EyeSlashIcon className="h-5 w-5" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    {layer.type === "image" && layer.image ? (
                                                        <img
                                                            src={layer.image.src}
                                                            alt="Layer Thumbnail"
                                                            className="h-10 w-10 object-cover rounded-md border"
                                                        />
                                                    ) : layer.type === "text" ? (
                                                        <span
                                                            className="text-sm font-medium text-gray-100 truncate"
                                                            style={{
                                                                display: "block",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                maxWidth: "120px" // عرض محدود موردنظر
                                                            }}
                                                        >
                                                            {layer.text}
                                                        </span>

                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-700 rounded-md" />
                                                    )}
                                                </div>

                                                {/* کنترل قفل و حذف */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLayer(layer.id, { locked: !layer.locked });
                                                        }}
                                                        className={`p-2 rounded-full ${layer.locked
                                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                            : "bg-gray-500 hover:bg-gray-600 text-white"
                                                            }`}
                                                    >
                                                        {layer.locked ? (
                                                            <LockClosedIcon className="h-5 w-5" />
                                                        ) : (
                                                            <LockOpenIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteLayer(layer.id);
                                                        }}
                                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {sidebarView === "layers" && (
                            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-6">
                                <div className="mt-8">
                                    <h2 className="text-md font-semibold text-gray-100 mb-4">📂 لایه‌ها</h2>
                                    <ul className="space-y-3">
                                        {layers.map((layer) => (
                                            <li
                                                key={layer.id}
                                                className={`flex items-center justify-between p-3 rounded-lg shadow-md border transition-all duration-300 cursor-pointer ${selectedLayer === layer.id
                                                    ? "border-blue-500 bg-gray-700"
                                                    : "border-gray-600 bg-gray-800 hover:border-gray-500"
                                                    }`}
                                                onClick={() => selectLayer(layer.id)}
                                            >
                                                {/* کنترل نمایش و قفل */}
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLayer(layer.id, { hidden: !layer.hidden });
                                                        }}
                                                        className={`p-2 rounded-full shadow ${layer.hidden
                                                            ? "bg-red-500 hover:bg-red-600 text-white"
                                                            : "bg-green-500 hover:bg-green-600 text-white"
                                                            }`}
                                                    >
                                                        {layer.hidden ? (
                                                            <EyeSlashIcon className="h-5 w-5" />
                                                        ) : (
                                                            <EyeIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    {layer.type === "image" && layer.image ? (
                                                        <img
                                                            src={layer.image.src}
                                                            alt="Layer Thumbnail"
                                                            className="h-10 w-10 object-cover rounded-md border"
                                                        />
                                                    ) : layer.type === "text" ? (
                                                        <span
                                                            className="text-sm font-medium text-gray-100 truncate"
                                                            style={{
                                                                display: "block",
                                                                whiteSpace: "nowrap",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                maxWidth: "120px" // عرض محدود موردنظر
                                                            }}
                                                        >
                                                            {layer.text}
                                                        </span>

                                                    ) : (
                                                        <div className="h-10 w-10 bg-gray-700 rounded-md" />
                                                    )}
                                                </div>

                                                {/* کنترل قفل و حذف */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            updateLayer(layer.id, { locked: !layer.locked });
                                                        }}
                                                        className={`p-2 rounded-full ${layer.locked
                                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                                            : "bg-gray-500 hover:bg-gray-600 text-white"
                                                            }`}
                                                    >
                                                        {layer.locked ? (
                                                            <LockClosedIcon className="h-5 w-5" />
                                                        ) : (
                                                            <LockOpenIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteLayer(layer.id);
                                                        }}
                                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {/* سایدبار انتخاب رنگ */}
                        {sidebarView === "colorPicker" && (
                            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-6">
                                <h2 className="text-lg font-semibold">🎨 انتخاب رنگ</h2>

                                {/* رنگ‌های پیش‌فرض */}
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        "#000000", "#808080", "#C0C0C0", "#FFFFFF", "#FF0000",
                                        "#800000", "#FFFF00", "#808000", "#00FF00", "#008000",
                                        "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF",
                                        "#800080", "#FFA500", "#A52A2A", "#ADD8E6", "#90EE90",
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            className="w-10 h-10 rounded-full border-2 border-gray-700 hover:border-blue-400"
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                                // اعمال فوری رنگ
                                                updateLayer(selectedLayer, { fill: color });
                                                saveHistory(
                                                    layers.map((layer) =>
                                                        layer.id === selectedLayer ? { ...layer, fill: color } : layer
                                                    )
                                                );
                                            }}
                                        ></button>
                                    ))}
                                </div>

                                {/* ورودی انتخاب رنگ دستی */}
                                <div className="flex items-center gap-4 mt-4">
                                    <label htmlFor="customColor" className="text-sm font-medium">
                                        یا رنگ سفارشی انتخاب کنید:
                                    </label>
                                    <input
                                        id="customColor"
                                        type="color"
                                        className="w-10 h-10 rounded-full border-2 border-gray-700 focus:ring-blue-500 focus:outline-none"
                                        value={tempColor || "#000000"}
                                        onChange={(e) => setTempColor(e.target.value)} // تغییر مقدار بدون اعمال
                                        onBlur={() => {
                                            // زمانی که کاربر بیرون کلیک می‌کند، رنگ اعمال شود
                                            if (tempColor) {
                                                updateLayer(selectedLayer, { fill: tempColor });
                                                saveHistory(
                                                    layers.map((layer) =>
                                                        layer.id === selectedLayer ? { ...layer, fill: tempColor } : layer
                                                    )
                                                );
                                                setTempColor(null); // پاک کردن مقدار
                                            }
                                        }}
                                    />
                                </div>

                                {/* دکمه بازگشت */}
                                <button
                                    onClick={() => setSidebarView("DefaultView")}
                                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                >
                                    بازگشت به تنظیمات
                                </button>
                            </div>
                        )}
                        {/* سایدبار ویرایش متن */}
                        {sidebarView === "editText" && editingText && (
                            <div className="bg-gray-800 p-4 rounded-lg shadow-lg space-y-4">
                                <h3 className="text-xl font-semibold text-white">ویرایش متن</h3>
                                <textarea
                                    value={textEditValue}
                                    onChange={(e) => setTextEditValue(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-gray-600 bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="متن خود را وارد کنید..."
                                    rows={4}
                                />
                                <div className="flex justify-between">
                                    <button
                                        onClick={handleTextSave}
                                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                                    >
                                        ذخیره
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSidebarView("DefaultView");
                                            setEditingText(false);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                                    >
                                        انصراف
                                    </button>
                                </div>
                            </div>
                        )}
                        {/*  سایدبار ویرایش رنگ پس زمینه */}
                        {sidebarView === "backgroundPicker" && (
                            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-6">
                                <h2 className="text-lg font-semibold">🎨 تغییر رنگ پس‌زمینه</h2>

                                {/* رنگ‌های پیش‌فرض */}
                                <div className="grid grid-cols-5 gap-3">
                                    {[
                                        "#000000", "#808080", "#C0C0C0", "#FFFFFF", "#FF0000",
                                        "#800000", "#FFFF00", "#808000", "#00FF00", "#008000",
                                        "#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF",
                                        "#800080", "#FFA500", "#A52A2A", "#ADD8E6", "#90EE90",
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            className="w-10 h-10 rounded-full border-2 border-gray-700 hover:border-blue-400"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setBackgroundColor(color)} // تنظیم رنگ پس‌زمینه
                                        ></button>
                                    ))}
                                </div>

                                {/* انتخاب رنگ سفارشی */}
                                <div className="flex items-center gap-4 mt-4">
                                    <label htmlFor="customBackgroundColor" className="text-sm font-medium">
                                        یا رنگ سفارشی انتخاب کنید:
                                    </label>
                                    <input
                                        id="customBackgroundColor"
                                        type="color"
                                        className="w-10 h-10 rounded-full border-2 border-gray-700 focus:ring-blue-500 focus:outline-none"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                    />
                                </div>

                                {/* دکمه بازگشت */}
                                <button
                                    onClick={() => setSidebarView("DefaultView")}
                                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                >
                                    بازگشت به تنظیمات
                                </button>
                            </div>
                        )}
                        {sidebarView === "fontPicker" && (
                            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg h-full flex flex-col">
                                {/* هدر ثابت */}
                                <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                                    <h2 className="text-lg font-semibold">✏️ انتخاب فونت</h2>
                                    <button
                                        onClick={() => setSidebarView("DefaultView")}
                                        className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md transition-all"
                                    >
                                        بازگشت
                                    </button>
                                </div>

                                {/* جستجو و تب‌ها */}
                                <div className="mb-4">
                                    {/* جستجو */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <input
                                            type="text"
                                            placeholder="جستجو بر اساس نام فارسی یا انگلیسی..."
                                            className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onChange={(e) => setFontSearchQuery(e.target.value)}
                                        />
                                    </div>

                                    {/* تب‌ها */}
                                    <div className="flex justify-around text-sm font-medium border-b border-gray-600 pb-2">
                                        <button
                                            className={`px-4 py-2 ${activeTab === "all" ? "text-blue-500" : "text-gray-400 hover:text-gray-200"}`}
                                            onClick={() => setActiveTab("all")}
                                        >
                                            همه
                                        </button>
                                        <button
                                            className={`px-4 py-2 ${activeTab === "favorites" ? "text-blue-500" : "text-gray-400 hover:text-gray-200"}`}
                                            onClick={() => setActiveTab("favorites")}
                                        >
                                            علاقه‌مندی‌ها
                                        </button>
                                    </div>
                                </div>

                                {/* لیست فونت‌ها با قابلیت اسکرول */}
                                <div className="overflow-y-auto flex-grow space-y-4 scrollbar scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                                    {filteredFonts.map((font) => (
                                        <div
                                            key={font.name}
                                            className={`flex justify-between items-center p-3 rounded-lg border ${selectedFont === font.name
                                                ? "border-blue-500 bg-gray-700"
                                                : "border-gray-600 hover:border-gray-500"
                                                }`}
                                            onClick={() => {
                                                setSelectedFont(font.name); // فونت انتخاب‌شده
                                                updateLayer(selectedLayer, { fontFamily: font.name }); // اعمال فونت به لایه انتخاب‌شده
                                                saveHistory(
                                                    layers.map((layer) =>
                                                        layer.id === selectedLayer ? { ...layer, fontFamily: font.name } : layer
                                                    )
                                                );
                                            }}
                                        >
                                            {/* پیش‌نمایش فونت */}
                                            <div>
                                                <p
                                                    className="text-lg"
                                                    style={{ fontFamily: font.name }}
                                                >
                                                    کلمه تست
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {font.customName || font.name} {/* نمایش نام مشخص‌شده یا نام اصلی */}
                                                </p>
                                                <p className="text-xs text-gray-500">{font.name}</p> {/* نام اصلی فونت */}
                                            </div>

                                            {/* دکمه علاقه‌مندی */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(font.name);
                                                }}
                                                className={`text-xl ${favorites.includes(font.name) ? "text-red-500" : "text-gray-400 hover:text-gray-200"}`}
                                            >
                                                {favorites.includes(font.name) ? "❤️" : "🤍"} {/* قلب پر یا خالی */}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Canvas */}
                <div className="w-2/3 bg-gray-200 flex justify-center items-center">
                    <div className="w-full h-full border-2 border-dashed border-gray-400 flex justify-center items-center">
                        {/* بوم شما */}
                        <Stage
                            width={window.innerWidth <= 768 ? window.innerWidth : containerWidth * 0.7} // 100% برای موبایل و 70% برای دسکتاپ
                            height={window.innerHeight - HEADER_HEIGHT - FOOTER_MARGIN} // ارتفاع بوم
                            scaleX={zoomScale}
                            scaleY={zoomScale}
                            x={position.x}
                            y={position.y}
                            draggable={!selectedLayer} // فعال‌سازی درگ فقط وقتی که هیچ لایه‌ای انتخاب نشده است
                            onWheel={handleZoom} // مدیریت زوم
                            onDragEnd={handleDragEnd} // مدیریت جابجایی
                            style={{
                                backgroundColor: backgroundColor,
                                border: '1px solid #ddd',

                            }}
                            onClick={() => closeToolbar()}
                        >

                            <Layer
                                clipX={0}
                                clipY={0}
                                clipWidth={templateSize.width}
                                clipHeight={templateSize.height}
                            >
                                {/* مرز ناحیه طراحی */}
                                <Rect
                                    x={0}
                                    y={0}
                                    width={templateSize.width}
                                    height={templateSize.height}
                                    stroke="blue"
                                    strokeWidth={2}
                                    dash={[10, 5]} // ایجاد خط‌چین
                                    listening={false} // جلوگیری از تعامل

                                />
                                {layers.map((layer) => {

                                    if (layer.type === 'rect') {
                                        return (
                                            <Rect
                                                key={layer.id}
                                                ref={(node) => (layerRefs.current[layer.id] = node)}
                                                {...layer}
                                                draggable={!layer.locked}
                                                visible={!layer.hidden} // اینجا اضافه شد
                                                onClick={(e) => {
                                                    e.cancelBubble = true;
                                                    selectLayer(layer.id);
                                                    handleLayerSelect(layer);
                                                }}
                                                onDragStart={(e) => {
                                                    e.cancelBubble = true; // جلوگیری از تأثیر روی Stage
                                                    setIsDraggingLayer(true); // شروع جابجایی لایه
                                                    closeToolbar()
                                                }}
                                                onDragEnd={(e) => {
                                                    const node = e.target;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                    });
                                                    setIsDraggingLayer(false); // پایان جابجایی لایه
                                                    handleLayerSelect(layer); // نمایش نوار ابزار در محل جدید

                                                }}
                                                onTransformEnd={(e) => {
                                                    const node = e.target;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                        width: node.width() * node.scaleX(),
                                                        height: node.height() * node.scaleY(),
                                                        rotation: node.rotation(),
                                                    });
                                                    node.scaleX(1);
                                                    node.scaleY(1);
                                                }}
                                            />
                                        );
                                    }

                                    if (layer.type === 'text') {
                                        return (
                                            <KonvaText
                                                key={layer.id}
                                                ref={(node) => (layerRefs.current[layer.id] = node)}
                                                {...layer}
                                                visible={!layer.hidden} // اینجا اضافه شد
                                                draggable={!layer.locked}
                                                fontFamily={layer.fontFamily || 'Arial'} // تنظیم فونت
                                                fontSize={layer.fontSize || 20} // تنظیم اندازه
                                                align={layer.align || 'left'} // تنظیم تراز
                                                lineHeight={layer.lineHeight || 1.2}
                                                fontStyle={layer.fontStyle || 'normal'}
                                                stroke={layer.stroke || 'black'}
                                                strokeWidth={layer.strokeWidth || 1}
                                                shadowColor={layer.shadowColor || 'black'}
                                                shadowBlur={layer.shadowBlur || 0}
                                                shadowOffsetX={layer.shadowOffsetX || 0}
                                                shadowOffsetY={layer.shadowOffsetY || 0}
                                                shadowOpacity={layer.shadowOpacity || 1}
                                                // width={layer.width || 200} // عرض متن برای چندخطی شدن
                                                textDecoration={layer.textDecoration || 'none'}

                                                onClick={(e) => {
                                                    e.cancelBubble = true;
                                                    selectLayer(layer.id);
                                                    handleLayerClick(layer.id)
                                                    handleLayerSelect(layer);

                                                }}
                                                onDragStart={() => closeToolbar()} // پنهان کردن نوار ابزار
                                                onDragEnd={(e) => {
                                                    const node = e.target;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                    });
                                                    handleLayerSelect(layer); // نمایش نوار ابزار در محل جدید
                                                }}
                                                onTransformEnd={(e) => {
                                                    const node = e.target;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                        rotation: node.rotation(),
                                                        fontSize: node.fontSize() * node.scaleX(),
                                                    });
                                                    node.scaleX(1);
                                                    node.scaleY(1);
                                                }}
                                            />
                                        );
                                    }

                                    if (layer.type === 'image') {
                                        return (
                                            <KonvaImage
                                                key={layer.id}
                                                ref={(node) => (layerRefs.current[layer.id] = node)}
                                                {...layer}
                                                draggable={!layer.locked}
                                                visible={!layer.hidden} // اینجا اضافه شد
                                                opacity={layer.opacity || 1}
                                                shadowColor={layer.shadowColor || 'black'}
                                                shadowBlur={layer.shadowBlur || 0}
                                                shadowOffsetX={layer.shadowOffsetX || 0}
                                                shadowOffsetY={layer.shadowOffsetY || 0}
                                                shadowOpacity={layer.shadowOpacity || 1}
                                                filters={[Konva.Filters.Blur, Konva.Filters.Brighten]}
                                                blurRadius={layer.blurRadius || 0}
                                                brightness={layer.brightness || 0}
                                                image={layer.image} // مقدار تصویر بارگذاری‌شده


                                                onClick={(e) => {
                                                    e.cancelBubble = true;
                                                    selectLayer(layer.id);
                                                    handleLayerSelect(layer);

                                                }}
                                                onDragStart={() => closeToolbar()} // پنهان کردن نوار ابزار
                                                onDragEnd={(e) => {
                                                    const node = e.target;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                    });
                                                    handleLayerSelect(layer); // نمایش نوار ابزار در محل جدید
                                                }}
                                                onTransformEnd={(e) => {
                                                    const node = e.target;

                                                    // حفظ نسبت تصویر هنگام تغییر اندازه
                                                    const scaleX = node.scaleX();
                                                    const scaleY = node.scaleY();
                                                    const newWidth = node.width() * scaleX;
                                                    const newHeight = node.height() * scaleY;
                                                    updateLayer(layer.id, {
                                                        x: node.x(),
                                                        y: node.y(),
                                                        width: newWidth,
                                                        height: newHeight,
                                                        rotation: node.rotation(),
                                                    });
                                                    node.scaleX(1);
                                                    node.scaleY(1);
                                                }}
                                            />
                                        );
                                    }

                                    return null;
                                })}
                                <Transformer ref={transformerRef} />
                            </Layer>


                        </Stage>
                    </div>
                </div>
            </div>

            {
                toolbarPosition && (
                    <div
                        className="absolute z-50 bg-white border rounded shadow-md flex items-center"
                        style={{
                            top: toolbarPosition.y,
                            left: toolbarPosition.x,
                            transform: "translate(-50%, -100%)", // تنظیم مکان برای مرکز کردن
                        }}
                    >
                        <button
                            className="p-2 hover:bg-gray-200"
                            onClick={() => {
                                deleteLayer(selectedLayer);
                                closeToolbar();
                            }}
                        >
                            <TrashIcon className="h-5 w-5 text-red-500" />
                        </button>
                        {layers.find((layer) => layer.id === selectedLayer)?.type === "text" && (
                            <button
                                className="p-2 hover:bg-gray-200"
                                onClick={() => {
                                    setSidebarView("editText"); // کار اول: تغییر ویو سایدبار
                                    handleEditButtonClick();
                                    closeToolbar();
                                }}
                            >
                                <PencilIcon className="h-5 w-5 text-blue-500" />
                            </button>
                        )}
                        <div className="relative">
                            <button
                                className="p-2 hover:bg-gray-200"
                                onClick={() => setShowMoreMenu((prev) => !prev)}
                            >
                                <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                            </button>
                            {showMoreMenu && (
                                <div className="absolute right-0 mt-2 bg-white border rounded shadow-md">
                                    <button
                                        className="p-2 flex items-center hover:bg-gray-200"
                                        onClick={() => {
                                            bringToFront(selectedLayer);
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <ChevronUpIcon className="h-5 w-5 text-green-500 mr-2" />
                                        جلو آوردن
                                    </button>
                                    <button
                                        className="p-2 flex items-center hover:bg-gray-200"
                                        onClick={() => {
                                            sendToBack(selectedLayer);
                                            setShowMoreMenu(false);
                                        }}
                                    >
                                        <ChevronDownIcon className="h-5 w-5 text-blue-500 mr-2" />
                                        به پشت بردن
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }


        </div >
    );



}