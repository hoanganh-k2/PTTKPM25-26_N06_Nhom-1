// src/migration/create-tables.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function createTables() {
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_KEY || '',
  );

  console.log('Creating tables...');

  try {
    // Enable UUID extension
    const { error: uuidError } = await supabase.rpc('create_uuid_extension');
    if (uuidError) {
      console.error('Error creating UUID extension:', uuidError);
    } else {
      console.log('UUID extension created successfully');
    }

    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError) {
      console.error('Error creating users table:', usersError);
    } else {
      console.log('Users table created successfully');
    }

    // Create authors table
    const { error: authorsError } = await supabase.rpc('create_authors_table');
    if (authorsError) {
      console.error('Error creating authors table:', authorsError);
    } else {
      console.log('Authors table created successfully');
    }

    // Create carts table
    const { error: cartsError } = await supabase.rpc('create_carts_table');
    if (cartsError) {
      console.error('Error creating carts table:', cartsError);
    } else {
      console.log('Carts table created successfully');
    }

    // Create cart_items table
    const { error: cartItemsError } = await supabase.rpc('create_cart_items_table');
    if (cartItemsError) {
      console.error('Error creating cart_items table:', cartItemsError);
    } else {
      console.log('Cart items table created successfully');
    }

    // Continue with other tables...
    
    console.log('Database migration completed');
  } catch (error) {
    console.error('Error in migration:', error);
  }
}

createTables();
