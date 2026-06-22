import { AppDataSource } from "../config/dataSource";
import { Product } from "../entities/Product";
import { ProductRepository } from "../repositories/product.repository";

interface IProduct {
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: number;
  stock: number;
}

const productsToPreLoad: IProduct[] = [
  {
    name: "Fender Precision Bass",
    price: 800,
    description:
      "Alder body, maple neck with modern C profile, split single-coil pickup, 20 medium jumbo frets, vintage-style bridge, passive electronics.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169698/soundnest/products/kli06xwjijozplsqerym.webp",
    categoryId: 1,
    stock: 10,
  },
  {
    name: "Fender Jazz Bass",
    price: 900,
    description:
      "Offset alder body, maple neck with slim profile, dual single-coil pickups, 20 frets, passive electronics, vintage-style tuners.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169687/soundnest/products/ddhzes0ud0umvun1gngv.webp",
    categoryId: 1,
    stock: 8,
  },
  {
    name: "Music Man StingRay",
    price: 1800,
    description:
      "Ash body, maple neck, active 3-band EQ preamp, humbucker pickup with neodymium magnets, 21 frets, high-mass bridge.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169697/soundnest/products/mc2etmhssthkytq7aypm.jpg",
    categoryId: 1,
    stock: 5,
  },
  {
    name: "Warwick Corvette Standard Fretless",
    price: 1600,
    description:
      "Solid swamp ash body, fretless wenge fingerboard, bolt-on ovangkol neck, MEC pickups, 2-band active EQ.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169668/soundnest/products/cxje4czdpxzawnvsubax.jpg",
    categoryId: 1,
    stock: 6,
  },
  {
    name: "Classical Nylon Guitar Fender",
    price: 130,
    description:
      "Laminated spruce top, mahogany back and sides, wide nut width, 12-fret neck joint, classical-style headstock, nylon strings.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169669/soundnest/products/jiyh6ukqe3mt5tasj1fk.jpg",
    categoryId: 2,
    stock: 12,
  },
  {
    name: "Acoustic Steel-String Guitar Yamaha",
    price: 250,
    description:
      "Spruce top, sapele back and sides, rosewood fingerboard and bridge, scalloped bracing, die-cast tuners, steel strings.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169670/soundnest/products/xo1dv9puh5bfat3oev7y.jpg",
    categoryId: 2,
    stock: 15,
  },
  {
    name: "Fender Stratocaster",
    price: 1000,
    description:
      "Alder body, 3 single-coil pickups with 5-way selector, maple neck with modern C profile, synchronized tremolo bridge, 22 frets.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169672/soundnest/products/kod7bpkixd4w7syfpsxb.jpg",
    categoryId: 2,
    stock: 7,
  },
  {
    name: "Fender Telecaster",
    price: 1200,
    description:
      "Solid alder body, two single-coil pickups, string-through-body bridge, maple neck with 22 medium jumbo frets, fixed bridge.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169673/soundnest/products/tyt5jied7dqftdiep7zz.jpg",
    categoryId: 2,
    stock: 5,
  },
  {
    name: "PSR Modern Electric Guitar",
    price: 900,
    description:
      "Mahogany body with maple top, dual humbucker pickups, 24-fret rosewood fingerboard, tremolo bridge, wide-thin neck profile.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1781883946/soundnest/products/watjrpqdcucnfzf0cc7v.jpg",
    categoryId: 2,
    stock: 9,
  },
  {
    name: "Pearl Roadshow Drum Set",
    price: 500,
    description:
      '9-ply poplar shells, 5-piece configuration, 14" snare, 22" bass drum, chrome hardware, includes cymbals and throne.',
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169674/soundnest/products/fbozv36nqkqy66vj5wol.jpg",
    categoryId: 3,
    stock: 4,
  },
  {
    name: "Yamaha Stage Custom",
    price: 700,
    description:
      'Birch shells, 5-piece configuration with mounting system, 22" bass drum, 14" snare, lacquer finish, chrome hardware.',
    image:
      "https://es.yamaha.com/es/files/SCB_DUS_a_0002_7c990cac1dee48790f654fe60c06bea8.jpg?impolicy=resize&imwid=2000&imhei=800",
    categoryId: 3,
    stock: 3,
  },
  {
    name: "Tama Imperialstar",
    price: 780,
    description:
      '6-ply poplar shells, 5-piece setup with black nickel hardware, 14" snare, 22" bass drum, includes cymbals and hardware.',
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169678/soundnest/products/wzgoovnoetcc1ic9hbbr.jpg",
    categoryId: 3,
    stock: 2,
  },
  {
    name: "Delrin Standard Pick 0.73mm",
    price: 1,
    description:
      "0.73mm thickness, made of Delrin for improved grip, standard shape, matte finish, medium flexibility.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169679/soundnest/products/wxotllanhsajiiafme0r.jpg",
    categoryId: 4,
    stock: 200,
  },
  {
    name: "Celluloid Classic Pick 0.88mm",
    price: 1,
    description:
      "0.88mm thickness, celluloid construction, glossy surface, traditional teardrop shape, medium-heavy gauge.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169680/soundnest/products/vblzbrf7k46cackpyyuc.jpg",
    categoryId: 4,
    stock: 180,
  },
  {
    name: "Nylon Jazz Pick 1.20mm",
    price: 1,
    description:
      "1.20mm thickness, heavy nylon construction, small jazz shape, matte grip surface, firm attack response.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169681/soundnest/products/tuxrqef8o1wcyj4a8m6h.jpg",
    categoryId: 4,
    stock: 150,
  },
  {
    name: "Vic Firth 5A American Classic",
    price: 13,
    description:
      'Hickory wood, 5A size, wooden tip, medium taper, 16" length and .565" diameter, lacquer finish.',
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169682/soundnest/products/xe59t6z4eivynqnu7ws0.jpg",
    categoryId: 5,
    stock: 80,
  },
  {
    name: "Zildjian 5B Drumsticks",
    price: 15,
    description:
      'Hickory sticks, 5B size, oval wood tip, 16" length, .600" diameter, natural finish, high durability.',
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169683/soundnest/products/waemaf868u7qklaibtlw.jpg",
    categoryId: 5,
    stock: 70,
  },
  {
    name: "Elixir Nanoweb Bass Strings (.045 - .105)",
    price: 20,
    description:
      "Nickel-plated steel, long scale, Nanoweb coating, gauges: .045, .065, .085, .105, corrosion-resistant.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169684/soundnest/products/pdrvdfwaayp9j2r5beur.jpg",
    categoryId: 6,
    stock: 30,
  },
  {
    name: "D'Addario Pro-Arte Nylon Strings",
    price: 10,
    description:
      "Clear nylon trebles, silver-plated wound basses, normal tension, corrosion barrier packaging, laser-sorted for precision.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169685/soundnest/products/m6nwtkkcmerlxgxzvjgq.jpg",
    categoryId: 6,
    stock: 40,
  },
  {
    name: "Ernie Ball Regular Slinky Electric Strings",
    price: 10,
    description:
      "Nickel-plated steel, hex core, gauges .010–.046, bright tone, corrosion-resistant packaging.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1782169686/soundnest/products/w82fnap07ngomj5hglmy.jpg",
    categoryId: 6,
    stock: 50,
  },
  {
    name: "Magma BE170N Acoustic Strings",
    price: 20,
    description:
      "Nickel-plated steel, phosphor bronze coating, light gauge, extended durability, balanced tone for acoustic guitars.",
    image:
      "https://res.cloudinary.com/dcd1qwyhk/image/upload/v1781884024/soundnest/products/m8bnm71jhg0balrp3jmw.webp",
    categoryId: 6,
    stock: 45,
  },
];

export const preLoadProducts = async () => {
  const products = await ProductRepository.find();
  if (!products.length)
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(Product)
      .values(productsToPreLoad)
      .execute();
  console.log("Products preloaded");
};
