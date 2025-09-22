-- SQL functions for cart tables
-- This file should be executed in Supabase SQL editor

-- First, create trigger functions
CREATE OR REPLACE FUNCTION update_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create carts table
CREATE OR REPLACE FUNCTION create_carts_table()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS carts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
  );

  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

  -- Create trigger to update updated_at
  DROP TRIGGER IF EXISTS update_carts_updated_at_trigger ON carts;
  CREATE TRIGGER update_carts_updated_at_trigger
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_carts_updated_at();
END;
$$;

-- Function to create cart_items table
CREATE OR REPLACE FUNCTION create_cart_items_table()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cart_id, book_id)
  );

  -- Create indexes for faster queries
  CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
  CREATE INDEX IF NOT EXISTS idx_cart_items_book_id ON cart_items(book_id);

  -- Create trigger to update updated_at
  DROP TRIGGER IF EXISTS update_cart_items_updated_at_trigger ON cart_items;
  CREATE TRIGGER update_cart_items_updated_at_trigger
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_cart_items_updated_at();
END;
$$;

-- Execute the functions to create tables
SELECT create_carts_table();
SELECT create_cart_items_table();