export function getProductImageUrl(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('mattress')) {
    return '/products/mattress_bag.png';
  }
  if (lowerName.includes('sofa')) {
    return '/products/sofa_bag.png';
  }
  if (lowerName.includes('chair')) {
    return '/products/chair_bag.png';
  }
  if (lowerName.includes('fragile')) {
    return '/products/fragile_stickers.png';
  }
  if (lowerName.includes('cable label')) {
    return '/products/cable_labels.png';
  }
  if (lowerName.includes('knife')) {
    return '/products/utility_knife.png';
  }
  if (lowerName.includes('marker')) {
    return '/products/marker_pen.png';
  }
  if (lowerName.includes('port-a-robe')) {
    return '/products/wardrobe_box.png';
  }
  if (lowerName.includes('picture box')) {
    return '/products/picture_box.png';
  }
  if (lowerName.includes('tea chest')) {
    return '/products/tea_chest_box.png';
  }
  if (lowerName.includes('chest') || lowerName.includes('carton') || lowerName.includes('box')) {
    return '/products/cardboard_box.png';
  }
  if (lowerName.includes('dispenser')) {
    return '/products/tape_dispenser.png';
  }
  if (lowerName.includes('tape')) {
    return '/products/tape_roll.png';
  }
  if (lowerName.includes('bubblewrap')) {
    return '/products/bubblewrap.png';
  }
  if (lowerName.includes('wrapping paper') || lowerName.includes('paper')) {
    return '/products/wrapping_paper.png';
  }
  // Default fallback
  return '/products/cardboard_box.png';
}
