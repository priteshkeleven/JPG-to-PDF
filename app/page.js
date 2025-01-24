"use client";

import {useState} from "react";
import {
    DndContext,
    closestCenter,
    rectIntersection,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import './globals.css';
import jsPDF from 'jspdf';
import SortableItem from "@/components/SortableItems";

export default function Home() {
    const [images, setImages] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor)
    );

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        const validFiles = files.filter(
            (file) => file.type === "image/jpeg" || file.type === "image/jpg" || file.type === "image/png"
        );

        if (validFiles.length) {
            setImages([...images, ...validFiles]);
        } else {
            alert("Please select valid JPG files.");
        }
    };

    const handleRemoveImage = (id) => {
        console.log(id);
        setImages((prevImages) => prevImages.filter((image) => image.name !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.name === active.id);
                const newIndex = items.findIndex((item) => item.name === over.id);
                console.log(items, oldIndex, newIndex);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };


    const convertToPDF = async () => {
        if (!images.length) {
            alert("No images to convert!");
            return;
        }

        const pdf = new jsPDF("landscape");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < images.length; i++) {
            const imageFile = images[i];
            const imageData = await readFileAsDataURL(imageFile);

            const img = new window.Image();
            img.src = imageData;

            await new Promise((resolve) => {
                img.onload = () => {
                    const imgRatio = img.width / img.height;
                    const pageRatio = pageWidth / pageHeight;

                    let imgWidth, imgHeight;

                    if (imgRatio > pageRatio) {
                        imgWidth = pageWidth;
                        imgHeight = pageWidth / imgRatio;
                    } else {
                        imgHeight = pageHeight;
                        imgWidth = pageHeight * imgRatio;
                    }

                    const xOffset = (pageWidth - imgWidth) / 2;
                    const yOffset = (pageHeight - imgHeight) / 2;

                    pdf.addImage(img, "JPEG", xOffset, yOffset, imgWidth, imgHeight);

                    if (i < images.length - 1) {
                        pdf.addPage();
                    }

                    resolve();
                };
            });
        }

        pdf.save("converted.pdf");
    };

    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    return (
        <>
            <div className={"text-center pb-10"}>
                <nav className={"bg-indigo-100 p-6 mb-2"}>Convert JPG Files to PDF</nav>
                <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png"
                    multiple
                    onChange={handleFileChange}
                />
                <br/>
                {images.length > 0 && (
                    <div style={{marginTop: "20px"}}>
                        <h3><b>Reorder Images</b> (Just Drag to the place where you want to place and drop it there!)</h3>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={images}
                                strategy={verticalListSortingStrategy}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '10px',
                                        alignItems: 'center',
                                        justifyContent: "center",
                                        border: '1px solid lightgray',
                                        padding: '10px',
                                        margin: '10px',
                                    }}
                                >
                                    {images.map((image, index) => (
                                        <SortableItem
                                            key={`Image-${index}`}
                                            id={`${image.name}`}
                                            src={URL.createObjectURL(image)}
                                            alt={`Image ${index + 1}`}
                                            name={`${image.name}`}
                                            onRemove={handleRemoveImage}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                )}
                <button
                    onClick={convertToPDF}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        cursor: "pointer",
                        backgroundColor: "#007BFF",
                        color: "#FFF",
                        border: "none",
                        borderRadius: "5px",
                    }}
                >
                    Convert to PDF
                </button>
            </div>
        </>
    );
}
