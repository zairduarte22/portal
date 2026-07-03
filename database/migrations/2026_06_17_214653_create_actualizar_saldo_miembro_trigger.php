<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::unprepared("
            CREATE OR REPLACE FUNCTION actualizar_saldo_miembro()
            RETURNS TRIGGER AS $$
            BEGIN
                IF TG_OP = 'DELETE' THEN
                    UPDATE miembros 
                    SET saldo_pendiente = (SELECT COALESCE(SUM(pendiente), 0) FROM facturas WHERE id_miembro = OLD.id_miembro)
                    WHERE id = OLD.id_miembro;
                    RETURN OLD;
                ELSE
                    UPDATE miembros 
                    SET saldo_pendiente = (SELECT COALESCE(SUM(pendiente), 0) FROM facturas WHERE id_miembro = NEW.id_miembro)
                    WHERE id = NEW.id_miembro;
                    RETURN NEW;
                END IF;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS trg_actualizar_saldo_miembro ON facturas;
            
            CREATE TRIGGER trg_actualizar_saldo_miembro
            AFTER INSERT OR UPDATE OF pendiente OR DELETE ON facturas
            FOR EACH ROW
            EXECUTE FUNCTION actualizar_saldo_miembro();
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::unprepared("
            DROP TRIGGER IF EXISTS trg_actualizar_saldo_miembro ON facturas;
            DROP FUNCTION IF EXISTS actualizar_saldo_miembro();
        ");
    }
};
