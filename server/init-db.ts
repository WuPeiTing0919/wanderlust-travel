import pool from './db.js';

async function initDatabase() {
  const conn = await pool.getConnection();

  try {
    console.log('Connected to MySQL. Initializing database...');

    // Create destinations table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS destinations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        reviews INT NOT NULL DEFAULT 0,
        image VARCHAR(500) NOT NULL,
        category VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Add category column if table already exists without it
    try {
      await conn.execute(`ALTER TABLE destinations ADD COLUMN category VARCHAR(50) DEFAULT NULL`);
      console.log('Added "category" column to destinations.');
    } catch {
      // Column already exists
    }
    // Add description, latitude, longitude columns
    try {
      await conn.execute(`ALTER TABLE destinations ADD COLUMN description TEXT DEFAULT NULL`);
      console.log('Added "description" column to destinations.');
    } catch { /* already exists */ }
    try {
      await conn.execute(`ALTER TABLE destinations ADD COLUMN latitude DECIMAL(10,6) DEFAULT NULL`);
      console.log('Added "latitude" column to destinations.');
    } catch { /* already exists */ }
    try {
      await conn.execute(`ALTER TABLE destinations ADD COLUMN longitude DECIMAL(10,6) DEFAULT NULL`);
      console.log('Added "longitude" column to destinations.');
    } catch { /* already exists */ }
    console.log('Table "destinations" ready.');

    // Create categories table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) NOT NULL
      )
    `);
    console.log('Table "categories" ready.');

    // Create subscribers table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table "subscribers" ready.');

    // Create users table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await conn.execute(`ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'`);
      console.log('Added "role" column to users.');
    } catch { /* already exists */ }
    console.log('Table "users" ready.');

    // Create bookings table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        destination_id INT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INT NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (destination_id) REFERENCES destinations(id)
      )
    `);
    try {
      await conn.execute(`ALTER TABLE bookings ADD COLUMN status VARCHAR(20) DEFAULT 'confirmed'`);
      console.log('Added "status" column to bookings.');
    } catch { /* already exists */ }
    console.log('Table "bookings" ready.');

    // Create favorites table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        destination_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_fav (user_id, destination_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (destination_id) REFERENCES destinations(id)
      )
    `);
    console.log('Table "favorites" ready.');

    // Seed destinations
    const [existingDest] = await conn.execute('SELECT COUNT(*) as count FROM destinations');
    if ((existingDest as any)[0].count === 0) {
      await conn.execute(`
        INSERT INTO destinations (title, location, price, rating, reviews, image, category) VALUES
        ('Azure Coast Resort', 'Amalfi, Italy', 320, 4.9, 128, 'https://picsum.photos/seed/amalfi/800/600', 'Beach'),
        ('Mountain Retreat', 'Swiss Alps', 250, 4.8, 94, 'https://picsum.photos/seed/alps/800/600', 'Nature'),
        ('Desert Oasis', 'Dubai, UAE', 410, 4.7, 215, 'https://picsum.photos/seed/dubai/800/600', 'City'),
        ('Tropical Paradise', 'Bali, Indonesia', 180, 4.9, 342, 'https://picsum.photos/seed/bali/800/600', 'Beach'),
        ('Historic City Center', 'Kyoto, Japan', 210, 4.8, 189, 'https://picsum.photos/seed/kyoto/800/600', 'City'),
        ('Northern Lights Igloo', 'Tromsø, Norway', 550, 5.0, 76, 'https://picsum.photos/seed/aurora/800/600', 'Adventure')
      `);
      console.log('Seed data inserted into "destinations".');
    } else {
      // Update existing rows with category if missing
      await conn.execute(`UPDATE destinations SET category = 'Beach' WHERE category IS NULL AND id = 1`);
      await conn.execute(`UPDATE destinations SET category = 'Nature' WHERE category IS NULL AND id = 2`);
      await conn.execute(`UPDATE destinations SET category = 'City' WHERE category IS NULL AND id = 3`);
      await conn.execute(`UPDATE destinations SET category = 'Beach' WHERE category IS NULL AND id = 4`);
      await conn.execute(`UPDATE destinations SET category = 'City' WHERE category IS NULL AND id = 5`);
      await conn.execute(`UPDATE destinations SET category = 'Adventure' WHERE category IS NULL AND id = 6`);
      console.log('"destinations" categories updated.');
      // Update descriptions and coordinates
      const destMeta: Record<number, { desc: string; lat: number; lng: number }> = {
        1: { desc: 'Perched along the stunning Amalfi Coast, Azure Coast Resort offers breathtaking views of the Mediterranean Sea. Enjoy world-class Italian cuisine, explore charming coastal villages, and relax on sun-drenched beaches. The region is famous for its dramatic cliffs, lemon groves, and colorful architecture that has inspired artists for centuries.', lat: 40.6340, lng: 14.6027 },
        2: { desc: 'Nestled in the heart of the Swiss Alps, Mountain Retreat is a haven for nature lovers and adventure seekers. Experience pristine alpine meadows, crystal-clear lakes, and snow-capped peaks. Whether you prefer hiking scenic trails in summer or skiing world-class slopes in winter, this retreat offers year-round mountain magic.', lat: 46.8182, lng: 8.2275 },
        3: { desc: 'Experience the ultimate luxury in Dubai at Desert Oasis. From the iconic Burj Khalifa to vast golden dunes, Dubai seamlessly blends futuristic architecture with traditional Arabian culture. Enjoy world-class shopping, thrilling desert safaris, and fine dining that spans every cuisine imaginable.', lat: 25.2048, lng: 55.2708 },
        4: { desc: 'Discover the enchanting island of Bali, where lush rice terraces meet pristine beaches. Tropical Paradise offers an immersive experience in Balinese culture, from ancient temples to vibrant markets. Surf world-class waves, practice yoga in serene studios, or simply unwind with a traditional Balinese spa treatment.', lat: -8.3405, lng: 115.0920 },
        5: { desc: 'Step back in time in Kyoto, Japan\'s cultural heart. Historic City Center places you among thousands of classical Buddhist temples, stunning Shinto shrines, imperial palaces, and traditional wooden houses. Experience the art of the tea ceremony, stroll through bamboo groves, and witness the beauty of geisha culture.', lat: 35.0116, lng: 135.7681 },
        6: { desc: 'Witness the magical Northern Lights from the comfort of your glass igloo in Tromsø, Norway. This Arctic adventure offers once-in-a-lifetime experiences including dog sledding, reindeer encounters, and midnight sun in summer. The pristine Arctic wilderness provides the perfect backdrop for nature\'s most spectacular light show.', lat: 69.6492, lng: 18.9553 },
      };
      for (const [id, meta] of Object.entries(destMeta)) {
        await conn.execute(
          'UPDATE destinations SET description = ?, latitude = ?, longitude = ? WHERE id = ? AND description IS NULL',
          [meta.desc, meta.lat, meta.lng, id]
        );
      }
      console.log('"destinations" descriptions and coordinates updated.');
    }

    // Seed categories
    const [existingCat] = await conn.execute('SELECT COUNT(*) as count FROM categories');
    if ((existingCat as any)[0].count === 0) {
      await conn.execute(`
        INSERT INTO categories (name, icon) VALUES
        ('Beach', 'Sun'),
        ('City', 'Map'),
        ('Nature', 'Camera'),
        ('Adventure', 'Compass'),
        ('Flights', 'Plane')
      `);
      console.log('Seed data inserted into "categories".');
    } else {
      console.log('"categories" already has data, skipping seed.');
    }

    // Create cart_items table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        destination_id INT NOT NULL,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        guests INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (destination_id) REFERENCES destinations(id)
      )
    `);
    console.log('Table "cart_items" ready.');

    // Seed admin user
    const [existingAdmin] = await conn.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
    if ((existingAdmin as any)[0].count === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPw = await bcrypt.hash('admin123', 10);
      await conn.execute(
        "INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@wanderlust.com', ?, 'admin')",
        [hashedPw]
      );
      console.log('Admin user created: admin@wanderlust.com / admin123');
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    conn.release();
    await pool.end();
  }
}

initDatabase();
