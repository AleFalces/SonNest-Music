import {
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity({ name: "carts" })
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, {
    cascade: true,
    eager: true,
  })
  items: CartItem[];
}
