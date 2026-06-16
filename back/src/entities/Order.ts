import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

// status: pending, approved, rejected

@Entity({ name: "orders" })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column()
  date: Date;

  // Mercado Pago payment id, set when an order is created from a paid checkout.
  // Nullable: orders created by other paths (or before payments) have none.
  // Used to avoid creating duplicate orders for the same payment (idempotency).
  @Column({ nullable: true })
  paymentId: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToMany(() => Product)
  @JoinTable()
  products: Product[];
}
