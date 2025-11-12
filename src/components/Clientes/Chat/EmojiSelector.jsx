import React, { useState, useRef, useEffect } from "react";
import { Smile, Search, Heart, Zap, Star, Gift, Music, Camera } from "lucide-react";
import { Button, Input } from "@headlessui/react";

// Datos de emojis organizados por categorías
const emojiCategories = {
  recientes: {
    name: "Recientes",
    icon: "🕒",
    emojis: []
  },
  caritas: {
    name: "Caritas",
    icon: "😀",
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
      '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
      '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
      '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
      '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
      '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
      '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'
    ]
  },
  personas: {
    name: "Personas",
    icon: "👥",
    emojis: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
      '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅',
      '👄', '💋', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵',
      '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷'
    ]
  },
  animales: {
    name: "Animales",
    icon: "🐶",
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨',
      '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊',
      '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
      '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌',
      '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷️', '🕸️', '🦂',
      '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀',
      '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆'
    ]
  },
  comida: {
    name: "Comida",
    icon: "🍕",
    emojis: [
      '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
      '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥒',
      '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐',
      '🥖', '🍞', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩',
      '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙',
      '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈',
      '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠'
    ]
  },
  viajes: {
    name: "Viajes",
    icon: "✈️",
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹', '🛼',
      '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🛰️',
      '🚢', '⛵', '🛶', '🚤', '🛥️', '🚞', '🚝', '🚄', '🚅', '🚈',
      '🚂', '🚆', '🚇', '🚊', '🚉', '🚍', '🚘', '🚖', '🚡', '🚠',
      '🚟', '🎠', '🎡', '🎢', '💈', '🎪', '🎭', '🖼️', '🎨', '🎬'
    ]
  },
  objetos: {
    name: "Objetos",
    icon: "⚽",
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
      '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
      '🪁', '🏹', '🎯', '🥊', '🥋', '🎪', '🛹', '🛼', '🎗️', '🎟️',
      '🎫', '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉', '📱', '📲', '💻',
      '⌨️', '🖥️', '🖨️', '🖱️', '💾', '💿', '📀', '🧮', '🎥', '📹',
      '📷', '📸', '📻', '📺', '📼', '💿', '📀', '☎️', '📞', '📟'
    ]
  },
  naturaleza: {
    name: "Naturaleza",
    icon: "🌳",
    emojis: [
      '🌍', '🌎', '🌏', '🌐', '🗺️', '🗾', '🧭', '🏔️', '⛰️', '🌋',
      '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️', '🌲', '🌳', '🌴', '🌵',
      '🌶️', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪴', '🌱',
      '🌰', '🌸', '🌺', '🌻', '🌹', '🥀', '🌷', '💐', '🌼', '🌵',
      '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
      '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌫️', '🌈', '☂️', '💧'
    ]
  },
  corazones: {
    name: "Corazones",
    icon: "❤️",
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌',
      '💒', '💍', '💎', '🌹', '🥰', '😍', '😘', '💋', '👑', '💐'
    ]
  },
  símbolos: {
    name: "Símbolos",
    icon: "⭐",
    emojis: [
      '💯', '💥', '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💦', '💨',
      '❄️', '☄️', '🌈', '☀️', '🌙', '⭐', '🌠', '🎉', '🎊', '🎈',
      '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️', '🎫',
      '🎟️', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵', '🎶',
      '🎯', '🎲', '🎰', '🃏', '🀄', '🎴', '🎺', '🪗', '🎸', '🎻'
    ]
  }
};

// GIFs predefinidos (URLs de ejemplo - reemplaza con tus propios GIFs)
const gifs = [
  {
    id: 1,
    url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    title: "Celebración"
  },
  {
    id: 2,
    url: "https://media.giphy.com/media/l0MYryZTmQgvHI5TG/giphy.gif",
    title: "Aplausos"
  },
  {
    id: 3,
    url: "https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif",
    title: "Baile"
  },
  {
    id: 4,
    url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
    title: "Risa"
  },
  {
    id: 5,
    url: "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif",
    title: "Amor"
  },
  {
    id: 6,
    url: "https://media.giphy.com/media/26xBI73gWquCBBCDe/giphy.gif",
    title: "Sorpresa"
  }
];

// Stickers predefinidos (emojis grandes con efectos)
const stickers = [
  { id: 1, emoji: "🎉", name: "Celebración" },
  { id: 2, emoji: "❤️", name: "Amor" },
  { id: 3, emoji: "😂", name: "Risa" },
  { id: 4, emoji: "👏", name: "Aplausos" },
  { id: 5, emoji: "🔥", name: "Genial" },
  { id: 6, emoji: "💯", name: "Perfecto" },
  { id: 7, emoji: "✨", name: "Brillante" },
  { id: 8, emoji: "🚀", name: "Increíble" },
  { id: 9, emoji: "💪", name: "Fuerza" },
  { id: 10, emoji: "🎯", name: "Objetivo" },
  { id: 11, emoji: "🌟", name: "Estrella" },
  { id: 12, emoji: "⚡", name: "Energía" }
];

// Base de datos de emojis con palabras clave para búsqueda
const emojiKeywords = {
  '😀': ['feliz', 'sonrisa', 'alegre', 'contento'],
  '😃': ['feliz', 'sonrisa', 'alegre', 'contento'],
  '😄': ['feliz', 'sonrisa', 'alegre', 'contento', 'risa'],
  '😁': ['feliz', 'sonrisa', 'alegre', 'dientes'],
  '😆': ['risa', 'feliz', 'carcajada'],
  '😅': ['risa', 'sudor', 'nervioso'],
  '😂': ['risa', 'llanto', 'carcajada', 'divertido'],
  '🤣': ['risa', 'carcajada', 'rodar', 'suelo'],
  '😊': ['feliz', 'sonrisa', 'timido', 'contento'],
  '😍': ['amor', 'enamorado', 'corazones', 'ojos'],
  '🥰': ['amor', 'corazones', 'feliz', 'enamorado'],
  '😘': ['beso', 'amor', 'corazon'],
  '😭': ['llanto', 'triste', 'lagrimas'],
  '😢': ['triste', 'lagrima', 'llorar'],
  '😠': ['enojado', 'molesto', 'ira'],
  '😡': ['furioso', 'enojado', 'ira', 'rojo'],
  '🤔': ['pensativo', 'duda', 'pensar'],
  '😴': ['dormir', 'sueno', 'cansado'],
  '🤯': ['explosion', 'mente', 'sorpresa', 'shock'],
  '😎': ['genial', 'cool', 'lentes', 'sol'],
  '🤪': ['loco', 'divertido', 'lengua'],
  '🥳': ['fiesta', 'celebracion', 'cumpleanos'],
  '😷': ['enfermo', 'mascara', 'covid'],
  
  // Personas y gestos
  '👋': ['hola', 'saludo', 'adios', 'mano'],
  '👍': ['bien', 'ok', 'pulgar', 'arriba', 'bueno'],
  '👎': ['mal', 'pulgar', 'abajo', 'no'],
  '👏': ['aplausos', 'felicidades', 'bravo'],
  '🙏': ['rezar', 'por favor', 'gracias', 'namaste'],
  '💪': ['fuerte', 'musculo', 'fuerza', 'gym'],
  '🤝': ['acuerdo', 'trato', 'manos'],
  '✋': ['alto', 'stop', 'mano', 'cinco'],
  '👌': ['ok', 'perfecto', 'bien', 'circulo'],
  '✌️': ['paz', 'victoria', 'dos', 'dedos'],
  
  // Animales
  '🐶': ['perro', 'cachorro', 'mascota'],
  '🐱': ['gato', 'gatito', 'mascota'],
  '🐭': ['raton', 'mouse'],
  '🐻': ['oso', 'peluche'],
  '🦊': ['zorro', 'astuto'],
  '🐸': ['rana', 'verde'],
  '🐵': ['mono', 'chimpance'],
  '🦄': ['unicornio', 'magico', 'fantasia'],
  '🐝': ['abeja', 'miel'],
  '🦋': ['mariposa', 'transformacion'],
  
  // Comida
  '🍕': ['pizza', 'italiana', 'queso'],
  '🍔': ['hamburguesa', 'comida', 'rapida'],
  '🍟': ['papas', 'fritas', 'mcdonalds'],
  '🎂': ['pastel', 'cumpleanos', 'torta'],
  '🍎': ['manzana', 'fruta', 'roja'],
  '🍌': ['platano', 'amarillo', 'fruta'],
  '🍓': ['fresa', 'fruta', 'roja'],
  '☕': ['cafe', 'bebida', 'energia'],
  '🍺': ['cerveza', 'alcohol', 'bebida'],
  '🍷': ['vino', 'alcohol', 'copa'],
  
  // Corazones
  '❤️': ['amor', 'corazon', 'rojo'],
  '💛': ['corazon', 'amarillo', 'amor'],
  '💚': ['corazon', 'verde', 'amor'],
  '💙': ['corazon', 'azul', 'amor'],
  '💜': ['corazon', 'morado', 'amor'],
  '🖤': ['corazon', 'negro', 'amor'],
  '🤍': ['corazon', 'blanco', 'amor'],
  '💔': ['corazon', 'roto', 'triste'],
  
  // Símbolos
  '🔥': ['fuego', 'caliente', 'genial'],
  '⭐': ['estrella', 'favorito'],
  '✨': ['brillante', 'magia', 'sparkle'],
  '💯': ['cien', 'perfecto', 'completo'],
  '⚡': ['rayo', 'rapido', 'energia'],
  '🌈': ['arcoiris', 'colores', 'gay'],
  '☀️': ['sol', 'dia', 'calor'],
  '🌙': ['luna', 'noche'],
  '🎉': ['celebracion', 'fiesta', 'confeti'],
  '🎊': ['celebracion', 'fiesta', 'confeti']
};

// Componente de búsqueda
const SearchBar = ({ onSearch, searchTerm }) => (
  <div className="p-3 border-b border-gray-200 dark:border-gray-600">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Buscar emojis..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
);

// Componente de categorías
const CategoryTabs = ({ categories, activeCategory, onCategoryChange }) => (
  <div className="flex overflow-x-auto px-2 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600">
    {categories.map((category) => (
      <Button
        key={category}
        onClick={() => onCategoryChange(category)}
        className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg text-lg transition-colors ${
          activeCategory === category
            ? "bg-blue-500 text-white"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
        title={emojiCategories[category]?.name}
      >
        {emojiCategories[category]?.icon}
      </Button>
    ))}
    <Button
      onClick={() => onCategoryChange('stickers')}
      className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg transition-colors ${
        activeCategory === 'stickers'
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      title="Stickers"
    >
      <Star className="w-4 h-4" />
    </Button>
    <Button
      onClick={() => onCategoryChange('gifs')}
      className={`flex-shrink-0 px-3 py-2 mx-1 rounded-lg transition-colors ${
        activeCategory === 'gifs'
          ? "bg-blue-500 text-white"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      title="GIFs"
    >
      <Zap className="w-4 h-4" />
    </Button>
  </div>
);

// Componente principal del selector
const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, onStickerSelect, onGifSelect }) => {
  const [activeCategory, setActiveCategory] = useState('caritas');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState([]);

  const categories = Object.keys(emojiCategories).filter(cat => cat !== 'recientes');

  // Función mejorada de búsqueda
  const searchEmojis = (term) => {
    if (!term.trim()) return [];
    
    const searchLower = term.toLowerCase();
    const results = [];
    
    // Buscar en todas las categorías
    Object.values(emojiCategories).forEach(category => {
      if (category.emojis) {
        category.emojis.forEach(emoji => {
          // Buscar por palabras clave
          const keywords = emojiKeywords[emoji] || [];
          const matchesKeyword = keywords.some(keyword => 
            keyword.toLowerCase().includes(searchLower)
          );
          
          // Buscar por nombre de categoría
          const matchesCategory = category.name.toLowerCase().includes(searchLower);
          
          if (matchesKeyword || matchesCategory) {
            results.push(emoji);
          }
        });
      }
    });
    
    // Buscar en stickers
    stickers.forEach(sticker => {
      if (sticker.name.toLowerCase().includes(searchLower)) {
        results.push(sticker.emoji);
      }
    });
    
    // Eliminar duplicados
    return [...new Set(results)];
  };

  // Filtrar emojis por búsqueda o categoría
  const filteredEmojis = searchTerm.trim()
    ? searchEmojis(searchTerm)
    : emojiCategories[activeCategory]?.emojis || [];

  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
    
    // Agregar a recientes
    setRecentEmojis(prev => {
      const newRecents = [emoji, ...prev.filter(e => e !== emoji)].slice(0, 20);
      emojiCategories.recientes.emojis = newRecents;
      return newRecents;
    });
    
    onClose();
  };

  const handleStickerClick = (sticker) => {
    onStickerSelect(sticker);
    onClose();
  };

  const handleGifClick = (gif) => {
    onGifSelect(gif);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-14 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-50 w-96 h-80 flex flex-col">
      {/* Barra de búsqueda */}
      <SearchBar onSearch={setSearchTerm} searchTerm={searchTerm} />
      
      {/* Pestañas de categorías */}
      {!searchTerm.trim() && (
        <CategoryTabs 
          categories={recentEmojis.length > 0 ? ['recientes', ...categories] : categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      )}

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-3">
        {searchTerm.trim() ? (
          // Resultados de búsqueda
          <div>
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              {filteredEmojis.length > 0 
                ? `${filteredEmojis.length} resultados para "${searchTerm}"`
                : `Sin resultados para "${searchTerm}"`
              }
            </div>
            <div className="grid grid-cols-8 gap-2">
              {filteredEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={`${emoji} ${emojiKeywords[emoji]?.join(', ') || ''}`}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>
        ) : activeCategory === 'stickers' ? (
          // Stickers
          <div className="grid grid-cols-4 gap-3">
            {stickers.map((sticker) => (
              <Button
                key={sticker.id}
                onClick={() => handleStickerClick(sticker)}
                className="flex flex-col items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={sticker.name}
              >
                <span className="text-4xl mb-1">{sticker.emoji}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{sticker.name}</span>
              </Button>
            ))}
          </div>
        ) : activeCategory === 'gifs' ? (
          // GIFs
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <Button
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                className="relative overflow-hidden rounded-lg hover:opacity-80 transition-opacity"
                title={gif.title}
              >
                <img
                  src={gif.url}
                  alt={gif.title}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                  {gif.title}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          // Emojis normales
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <Button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={`${emoji} ${emojiKeywords[emoji]?.join(', ') || ''}`}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <Button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕ Cerrar
        </Button>
        <span className="text-xs text-gray-400">
          {searchTerm.trim()
            ? `${filteredEmojis.length} resultados`
            : activeCategory === 'stickers' 
              ? `${stickers.length} stickers`
              : activeCategory === 'gifs'
                ? `${gifs.length} GIFs`
                : `${filteredEmojis.length} emojis`
          }
        </span>
      </div>
    </div>
  );
};

// Componente principal
export default function EmojiSelector({ onEmojiSelect, inputRef }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiSelect = (emoji) => {
    onEmojiSelect(emoji);
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleStickerSelect = (sticker) => {
    // Los stickers se envían como emojis grandes
    onEmojiSelect(`${sticker.emoji} `);
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleGifSelect = (gif) => {
    // Para GIFs, podrías implementar una lógica especial
    // Por ahora los agregamos como texto con el título
    onEmojiSelect(`[GIF: ${gif.title}] `);
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={emojiRef}>
      <EmojiPicker
        isOpen={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
        onStickerSelect={handleStickerSelect}
        onGifSelect={handleGifSelect}
      />

      <Button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
          showEmojiPicker
            ? "bg-casal text-white scale-110"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        }`}
        title="Emojis, Stickers y GIFs"
      >
        <Smile className="w-4 h-4" />
      </Button>
    </div>
  );
}