import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/* =========================
   CONFIG
========================= */
const categoryConfig = {
  Licor: { desc: "Aromáticos e envolventes, os licores combinam frutas, ervas e especiarias em sabores únicos e irresistíveis." },
  Whisky: { desc: "Envelhecido em barris, o whisky entrega profundidade, aromas complexos e uma experiência rica a cada dose." },
  Gin: { desc: "Com notas de zimbro e botânicos selecionados, o gin entrega frescor, aroma e personalidade em cada drink." },
  Vodka: { desc: "De perfil limpo e versátil, a vodka se adapta perfeitamente aos mais variados estilos de drinks e combinações." },
  Rum: { desc: "Produzido a partir da cana-de-açúcar, o rum revela sabores que transitam entre o adocicado suave e notas amadeiradas intensas." },
  Tequila: { desc: "Feita com agave azul, a tequila carrega a essência mexicana em um destilado autêntico e cheio de atitude." },
  Cachaça: { desc: "Nascida da cana-de-açúcar, a cachaça traduz a autenticidade brasileira em um destilado marcante e versátil." },
  Aperitivo: { desc: "Leve e aromático, o aperitivo desperta o paladar e transforma encontros em momentos ainda mais especiais." },
  Amaro: { desc: "Ícone italiano de sabor amargo e herbal, o amaro combina ervas, raízes e especiarias em uma experiência intensa e sofisticada." },
  Pisco: { desc: "Tradicional na América do Sul, o pisco conquista pelo equilíbrio suave e elegância presente em clássicos da coquetelaria." },
  Mezcal: { desc: "O mezcal, conhecido como “a mãe de todas as tequilas”, é um destilado produzido a partir do cozimento e da destilação do agave." },
  "Cognac/Brandy": { desc: "Elegante e encorpado, o conhaque ganha riqueza de aromas e profundidade com o envelhecimento em barris." },
  Vermouth: { desc: "Sofisticado e aromático, o vermouth une vinho, ervas e especiarias em um clássico indispensável da coquetelaria." },
  Outros: { desc: "Raridades e destilados exclusivos" }
};



/* =========================
   CARD
========================= */
export function CategoryCard({ name }) {
  // Se o banco retornar "Cachaca" sem cedilha, exibimos corretamente e pegamos a config
  const displayName = name === "Cachaca" ? "Cachaça" : (name === "Bitter/Aperitivo" ? "Aperitivo" : name);
  const config = categoryConfig[displayName] || categoryConfig[name] || { desc: "" };

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Link
        to={`/catalog?category=${encodeURIComponent(name)}`}
        className="flex items-center gap-4 rounded-2xl p-4 bg-white/90 backdrop-blur-xl shadow-md hover:shadow-lg transition-shadow"
      >
        {/* CONTEÚDO */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold tracking-tight">{displayName}</h3>
          <p className="text-xs text-muted-foreground min-h-[16px]">
            {config.desc || "\u00A0"}
          </p>
        </div>
        {/* SETA */}
        <div className="text-muted-foreground/40">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}

/* =========================
   LISTA FINAL
========================= */
export default function CategoryStackList({ categories }) {
  const finalCategories =
    categories && categories.length > 0
      ? categories
      : Object.keys(categoryConfig);

  return (
    <div
      className="relative w-full space-y-6"
      style={{
        paddingBottom: "60vh"
      }}
    >
      {finalCategories.map((name) => (
        <CategoryCard
          key={name}
          name={name}
        />
      ))}
    </div>
  );
}