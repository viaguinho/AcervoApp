"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "../ProductCard";

const getCardTransform = (normDist) => {
    if (normDist === 0) {
        return {
            rotateY: 0,
            scale: 1.0,
            x: 0,
            opacity: 1,
            zIndex: 20,
            brightness: 1,
        };
    }
    const sign = normDist > 0 ? 1 : -1;
    const abs = Math.abs(normDist);
    if (abs === 1) {
        return {
            rotateY: -sign * 42,
            scale: 0.85,
            x: sign * 160,
            opacity: 0.9,
            zIndex: 10,
            brightness: 0.82,
        };
    }
    return {
        rotateY: -sign * 55,
        scale: 0.65,
        x: sign * 230,
        opacity: 0.4,
        zIndex: 0,
        brightness: 0.6,
    };
};

export default function Carousel3DPerspective({
    products = [],
    title,
}) {
    // Start with the second item if there are at least 3, else first
    const [active, setActive] = useState(products.length >= 3 ? 1 : 0);
    const total = products.length;

    if (!products || products.length === 0) return null;

    return (
        <div className="flex flex-col w-full pb-0 select-none">
            {/* Title */}
            {title && (
                <div className="px-6 mb-3">
                    <div className="max-w-lg mx-auto">
                        {typeof title === "string" ? (
                            <h2 className="text-[11px] uppercase flex items-center gap-2 font-medium tracking-[0.3em] font-outfit text-muted-foreground/50">
                                {title}
                            </h2>
                        ) : (
                            title
                        )}
                    </div>
                </div>
            )}

            {/* 3D Stage */}
            <div
                className="relative flex items-start justify-center w-full"
                style={{
                    height: 410, // Adjusted height to fit top-aligned cards
                    perspective: "1000px",
                    overflow: "visible",
                    touchAction: "pan-y"
                }}
            >
                {products.map((product, i) => {
                    const distance = ((i - active + total) % total + total) % total;
                    const normDist = distance > total / 2 ? distance - total : distance;
                    if (Math.abs(normDist) > 2) return null; // Show up to 5 cards (active, 2 left, 2 right)

                    const t = getCardTransform(normDist);

                    return (
                        <motion.div
                            key={product.id || i}
                            className="absolute"
                            drag={normDist === 0 ? "x" : false}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.15}
                            onDragEnd={(e, { offset }) => {
                                if (offset.x < -40) setActive((prev) => (prev + 1) % total);
                                else if (offset.x > 40) setActive((prev) => (prev - 1 + total) % total);
                            }}
                            animate={{
                                rotateY: t.rotateY,
                                scale: t.scale,
                                x: t.x,
                                opacity: t.opacity,
                                filter: `brightness(${t.brightness})`,
                            }}
                            transition={{ type: "spring", stiffness: 140, damping: 18, mass: 0.75 }}
                            onClick={(e) => {
                                if (normDist !== 0) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActive(i);
                                }
                            }}
                            style={{
                                width: 260,
                                zIndex: t.zIndex,
                                cursor: normDist !== 0 ? "pointer" : (normDist === 0 ? "grab" : "default"),
                                transformStyle: "preserve-3d",
                                transformOrigin: normDist === 1 ? "left center" : normDist === -1 ? "right center" : "center",
                                pointerEvents: "auto"
                            }}
                        >
                            <div className={normDist !== 0 ? "pointer-events-none" : ""}>
                                <ProductCard product={product} index={i} hideStatus={true} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
