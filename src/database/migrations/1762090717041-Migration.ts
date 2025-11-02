import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1762090717041 implements MigrationInterface {
  name = 'Migration1762090717041';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."cart_items_currency_enum" AS ENUM('EUR', 'USD', 'GBP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" character varying(64) NOT NULL, "name" character varying(200) NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "currency" "public"."cart_items_currency_enum" NOT NULL DEFAULT 'EUR', "unitPrice" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "metadata" jsonb, "cartId" uuid NOT NULL, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_provider_enum" AS ENUM('STRIPE', 'PAYPAL', 'MANUAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('PENDING', 'REQUIRES_ACTION', 'COMPLETED', 'FAILED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_currency_enum" AS ENUM('EUR', 'USD', 'GBP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "provider" "public"."payments_provider_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'PENDING', "amount" numeric(12,2) NOT NULL, "currency" "public"."payments_currency_enum" NOT NULL, "externalId" character varying(120), "metadata" jsonb, "rawResponse" jsonb, "orderId" uuid NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'AWAITING_PAYMENT', 'PAID', 'CANCELLED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_preferredpaymentprovider_enum" AS ENUM('STRIPE', 'PAYPAL', 'MANUAL')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_currency_enum" AS ENUM('EUR', 'USD', 'GBP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "preferredPaymentProvider" "public"."orders_preferredpaymentprovider_enum", "totalAmount" numeric(12,2) NOT NULL, "subtotal" numeric(12,2) NOT NULL, "currency" "public"."orders_currency_enum" NOT NULL DEFAULT 'EUR', "itemsSnapshot" jsonb NOT NULL, "userId" uuid NOT NULL, "cartId" uuid NOT NULL, CONSTRAINT "REL_d7b6b269e131a5287bd05da4a5" UNIQUE ("cartId"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."carts_status_enum" AS ENUM('ACTIVE', 'CHECKED_OUT', 'ABANDONED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."carts_currency_enum" AS ENUM('EUR', 'USD', 'GBP')`,
    );
    await queryRunner.query(
      `CREATE TABLE "carts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."carts_status_enum" NOT NULL DEFAULT 'ACTIVE', "currency" "public"."carts_currency_enum" NOT NULL DEFAULT 'EUR', "subtotal" numeric(12,2) NOT NULL DEFAULT '0.00', "total" numeric(12,2) NOT NULL DEFAULT '0.00', "userId" uuid NOT NULL, CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "displayName" character varying(120) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_d7b6b269e131a5287bd05da4a51" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_d7b6b269e131a5287bd05da4a51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_af929a5f2a400fdb6913b4967e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "carts"`);
    await queryRunner.query(`DROP TYPE "public"."carts_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."carts_status_enum"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_preferredpaymentprovider_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
    await queryRunner.query(`DROP TABLE "cart_items"`);
    await queryRunner.query(`DROP TYPE "public"."cart_items_currency_enum"`);
  }
}
