-- CreateTable
CREATE TABLE "tracking_sessions" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "current_latitude" DOUBLE PRECISION,
    "current_longitude" DOUBLE PRECISION,
    "last_update" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tracking_sessions_order_id_key" ON "tracking_sessions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracking_sessions_token_key" ON "tracking_sessions"("token");

-- AddForeignKey
ALTER TABLE "tracking_sessions" ADD CONSTRAINT "tracking_sessions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
