import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity({ name: "cart_items" })
// A product appears at most once per cart; quantity tracks how many units.
@Unique(["cart", "product"])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "cartId" })
  cart: Cart;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "int", default: 1 })
  quantity: number;
}
