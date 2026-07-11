<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update the function logic to calculate solvencia
        DB::unprepared("
            CREATE OR REPLACE FUNCTION actualizar_saldo_miembro()
            RETURNS TRIGGER AS $$
            DECLARE
                nuevo_saldo NUMERIC;
            BEGIN
                IF TG_OP = 'DELETE' THEN
                    SELECT COALESCE(SUM(pendiente), 0) INTO nuevo_saldo FROM facturas WHERE id_miembro = OLD.id_miembro;
                    
                    UPDATE miembros 
                    SET saldo_pendiente = nuevo_saldo,
                        solvencia = CASE WHEN nuevo_saldo >= 100 THEN 'Insolvente'::estado_solvencia ELSE 'Solvente'::estado_solvencia END
                    WHERE id = OLD.id_miembro;
                    
                    RETURN OLD;
                ELSE
                    SELECT COALESCE(SUM(pendiente), 0) INTO nuevo_saldo FROM facturas WHERE id_miembro = NEW.id_miembro;
                    
                    UPDATE miembros 
                    SET saldo_pendiente = nuevo_saldo,
                        solvencia = CASE WHEN nuevo_saldo >= 100 THEN 'Insolvente'::estado_solvencia ELSE 'Solvente'::estado_solvencia END
                    WHERE id = NEW.id_miembro;
                    
                    RETURN NEW;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore the previous logic
        DB::unprepared("
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
        ");
    }
};
