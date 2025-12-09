const Implement = require('../models/Implement');

const IMPLEMENTS_LABEL = 'Wargo y accesorios para gym';

const mapImplement = (implement) => ({
  _id: implement._id,
  id: implement.id,
  name: implement.name,
  price: implement.price,
  originalPrice: implement.originalPrice,
  size: implement.size,
  sizes: implement.sizes || [],
  image: implement.image,
  isActive: implement.isActive,
  createdAt: implement.createdAt,
  updatedAt: implement.updatedAt,
});

exports.getImplements = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const query = includeInactive ? {} : { isActive: true };
    const implementsList = await Implement.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: implementsList.map(mapImplement) });
  } catch (error) {
    console.error('[ImplementController] getImplements error', error);
    res.status(500).json({ success: false, message: `Error al obtener ${IMPLEMENTS_LABEL}` });
  }
};

exports.createImplement = async (req, res) => {
  try {
    const { name, price, originalPrice, size, sizes, isActive, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre del accesorio para gym es obligatorio' });
    }
    if (price === undefined || price === null || price < 0) {
      return res.status(400).json({ success: false, message: 'El precio es obligatorio y debe ser mayor o igual a 0' });
    }

    const implementData = {
      name: name.trim(),
      price: Number(price),
      size: (size || '').trim(),
      isActive: typeof isActive === 'boolean' ? isActive : true,
    };

    // Agregar originalPrice si se proporciona
    if (typeof originalPrice === 'number' && originalPrice > 0) {
      implementData.originalPrice = originalPrice;
    }

    // Agregar sizes si se proporciona
    if (Array.isArray(sizes) && sizes.length > 0) {
      implementData.sizes = sizes;
    }

    // Manejar imagen - si viene un archivo, usar su path
    if (req.file) {
      implementData.image = req.file.path;
    } else if (typeof image === 'string' && image.trim()) {
      implementData.image = image.trim();
    }

    const implement = await Implement.create(implementData);

    res.status(201).json({ success: true, data: mapImplement(implement) });
  } catch (error) {
    console.error('[ImplementController] createImplement error', error);
    res.status(500).json({ success: false, message: `Error al crear ${IMPLEMENTS_LABEL}` });
  }
};

exports.updateImplement = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, size, isActive, originalPrice, sizes, image } = req.body;

    const implement = await Implement.findById(id);
    if (!implement) {
      return res.status(404).json({ success: false, message: 'Accesorio para gym no encontrado' });
    }

    if (typeof name === 'string') {
      implement.name = name.trim();
    }
    if (typeof price === 'number' && price >= 0) {
      implement.price = price;
    }
    if (typeof originalPrice === 'number' && originalPrice >= 0) {
      implement.originalPrice = originalPrice;
    }
    if (typeof size === 'string') {
      implement.size = size.trim();
    }
    if (Array.isArray(sizes) && sizes.length > 0) {
      implement.sizes = sizes;
    }
    if (typeof isActive === 'boolean') {
      implement.isActive = isActive;
    }
    
    // Manejar imagen - si viene un archivo, usar su path
    if (req.file) {
      implement.image = req.file.path;
    } else if (typeof image === 'string' && image.trim()) {
      // Si viene una URL en el body, usarla
      implement.image = image.trim();
    }

    await implement.save();
    res.json({ success: true, data: mapImplement(implement) });
  } catch (error) {
    console.error('[ImplementController] updateImplement error', error);
    res.status(500).json({ success: false, message: `Error al actualizar ${IMPLEMENTS_LABEL}` });
  }
};

exports.deleteImplement = async (req, res) => {
  try {
    const { id } = req.params;
    const implement = await Implement.findById(id);
    if (!implement) {
      return res.status(404).json({ success: false, message: 'Accesorio para gym no encontrado' });
    }

    await implement.deleteOne();
    res.json({ success: true, message: 'Accesorio para gym eliminado correctamente' });
  } catch (error) {
    console.error('[ImplementController] deleteImplement error', error);
    res.status(500).json({ success: false, message: `Error al eliminar ${IMPLEMENTS_LABEL}` });
  }
};
