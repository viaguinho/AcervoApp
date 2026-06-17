import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { GlowCard } from "./spotlight-card";

const bounceStyle = `
@keyframes bounceFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.bounce {
  animation: bounceFloat 3s ease-in-out infinite;
}
`;

import { Trash2 } from "lucide-react";

export function CategoryParallaxCard({
  title,
  description,
  imageUrl,
  className = "",
  onClick,
  onImageUpload,
  onImageDelete
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const fileInputRef = React.useRef(null);

  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleImageDeleteClick = (e) => {
    e.stopPropagation();
    if (onImageDelete) {
      onImageDelete();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  const fallbackImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='rgba(0,0,0,0.05)' rx='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='rgba(0,0,0,0.4)'>Imagem</text></svg>";

  return (
    <>
      <style>{bounceStyle}</style>

      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: 0.97, boxShadow: "0px 15px 35px rgba(0,0,0,0.25)" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn("relative w-full cursor-pointer rounded-2xl mb-8 group", className)}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />

        <GlowCard customSize glowColor="silver" style={/** @type {any} */ ({ "--backdrop": "white", backdropFilter: "none" })} className="!block !p-0 !m-0 !shadow-none !rounded-[1.25rem] w-full h-full border-none relative z-10">
          <Card className="relative z-10 rounded-[1.25rem] border-0 bg-transparent p-4 overflow-visible h-full flex flex-col justify-between min-h-[140px]">
            
            {/* Textura de Grid (mesma estética dos cards) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] rounded-[1.25rem] pointer-events-none" />

            <CardHeader className="p-0 relative z-10">

              <CardTitle className="text-xl font-outfit font-bold tracking-tight">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-w-[65%] relative z-10 mt-auto">
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description || "\u00A0"}</p>
              <Button variant="outline" className="mt-4 h-9 px-6 text-xs font-bold rounded-xl font-outfit pointer-events-none bg-white/50 backdrop-blur-sm border-black/5 hover:bg-white hover:border-black/10 transition-all">
                Explorar
              </Button>
            </CardContent>
          </Card>
        </GlowCard>

        <div className="absolute -top-6 -right-3 z-20 bounce drop-shadow-2xl flex flex-col items-end gap-2">
          {imageUrl && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.4)" }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleImageDeleteClick}
              className="p-1.5 rounded-full bg-red-500/20 text-white backdrop-blur-md border border-red-500/30 shadow-lg mr-2 transition-colors"
              title="Excluir imagem"
            >
              <Trash2 className="w-3 h-3" />
            </motion.button>
          )}
          <motion.img
            src={imageUrl || fallbackImage}
            alt={title}
            onClick={handleImageClick}
            className={cn(
              "h-32 w-32 object-contain cursor-pointer"
            )}
            whileHover={{
              scale: 1.15,
              y: -10,
              filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.2))",
            }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          />
        </div>
      </motion.div>
    </>
  );
}
