-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 12, 2026 at 03:32 PM
-- Server version: 10.11.18-MariaDB-cll-lve
-- PHP Version: 8.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `membresi_fondo_ugavi`
--

-- --------------------------------------------------------

--
-- Table structure for table `CONCILIACION_DIVISAS`
--

CREATE TABLE `CONCILIACION_DIVISAS` (
  `ID_MOV_DIVISAS` int(11) NOT NULL,
  `ID_INGRESOS` int(11) DEFAULT NULL,
  `ID_FACTURA` int(11) DEFAULT NULL,
  `ID_EGRESO` int(11) DEFAULT NULL,
  `FECHA` date DEFAULT curdate(),
  `CUENTA_CONTABLE` varchar(30) DEFAULT NULL,
  `TIPO_OPERACION` varchar(30) DEFAULT NULL,
  `REFERENCIA` varchar(30) DEFAULT NULL,
  `BENEFICIARIO` varchar(30) DEFAULT NULL,
  `DESCRIPCION` varchar(30) DEFAULT NULL,
  `INGRESO` decimal(10,2) DEFAULT NULL,
  `EGRESO` decimal(10,2) DEFAULT NULL,
  `METODO_PAGO` varchar(30) DEFAULT NULL,
  `TITULAR` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CONCILIACION_DIVISAS`
--

INSERT INTO `CONCILIACION_DIVISAS` (`ID_MOV_DIVISAS`, `ID_INGRESOS`, `ID_FACTURA`, `ID_EGRESO`, `FECHA`, `CUENTA_CONTABLE`, `TIPO_OPERACION`, `REFERENCIA`, `BENEFICIARIO`, `DESCRIPCION`, `INGRESO`, `EGRESO`, `METODO_PAGO`, `TITULAR`) VALUES
(12, 75, 77, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'ej829zotq', 'INGRESO PARTICULAR', 'FACT#10224', 100.00, 0.00, 'Zelle', '127'),
(13, 76, 78, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'YBJ1I6AJ', 'INGRESO PARTICULAR', 'FACT#10225', 80.00, 0.00, 'Zelle', '71'),
(14, 87, 89, NULL, '2025-05-22', 'Ingresos por Cuotas', 'TRANSF', 'i73bp8olo', 'INGRESO PARTICULAR', 'FACT#10236', 100.00, 0.00, 'Zelle', '127'),
(15, 91, 95, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'as2h1yt1b', 'INGRESO PARTICULAR', 'FACT#10240', 20.00, 0.00, 'Zelle', '152'),
(16, 92, 96, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'it7hes4vi', 'INGRESO PARTICULAR', 'FACT#10241', 100.00, 0.00, 'Zelle', '181'),
(17, 95, 99, NULL, '2025-05-27', 'Ingresos por Cuotas', 'TRANSF', 'fznk2q53d', 'INGRESO PARTICULAR', 'FACT#10244', 100.00, 0.00, 'Zelle', '127'),
(18, 102, 106, NULL, '2025-05-30', 'Ingresos por Cuotas', 'TRANSF', 'cabi6yt6x', 'INGRESO PARTICULAR', 'FACT#10251', 125.00, 0.00, 'Zelle', '125'),
(19, 142, 146, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'f1egmtoac', 'INGRESO PARTICULAR', 'FACT#10289', 20.00, 0.00, 'Zelle', '152'),
(20, 143, 147, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO DESDE CTA.', 'INGRESO PARTICULAR', 'FACT#10290', 60.00, 0.00, 'Zelle', '236'),
(21, 144, 148, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'ib7pi7vms', 'INGRESO PARTICULAR', 'FACT#10291', 100.00, 0.00, 'Zelle', '127'),
(22, 145, 149, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'i0wh6vye4', 'INGRESO PARTICULAR', 'FACT#10292', 100.00, 0.00, 'Zelle', '127'),
(23, 153, 157, NULL, '2025-06-25', 'Ingresos por Cuotas', 'TRANSF', 'bnqmcxw43', 'INGRESO PARTICULAR', 'FACT#10300', 100.00, 0.00, 'Zelle', '127'),
(24, 216, 220, NULL, '2025-07-14', 'Ingresos por Cuotas', 'TRANSF', 'atawcs2yo', 'INGRESO PARTICULAR', 'FACT#10363', 20.00, 0.00, 'Zelle', '152'),
(25, 223, 227, NULL, '2025-07-17', 'Ingresos por Cuotas', 'TRANSF', 'BACuo21dg830', 'INGRESO PARTICULAR', 'FACT#10370', 125.00, 0.00, 'Zelle', '23'),
(26, 246, 250, NULL, '2025-07-30', 'Ingresos por Cuotas', 'TRANSF', '', 'INGRESO PARTICULAR', 'FACT#10393', 237.20, 0.00, 'Efectivo Divisas', '266'),
(27, 285, 289, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'ej50jcz7u', 'INGRESO PARTICULAR', 'FACT#10432', 20.00, 0.00, 'Zelle', '152'),
(28, 286, 290, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'CRUCE', 'INGRESO PARTICULAR', 'FACT#10433', 40.00, 0.00, 'Zelle', '236'),
(29, 298, 302, NULL, '2025-08-15', 'Ingresos por Cuotas', 'TRANSF', 'BACauvpjkkts', 'INGRESO PARTICULAR', 'FACT#10445', 50.00, 0.00, 'Zelle', '390'),
(30, 398, 403, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'h4vw09vzh', 'INGRESO PARTICULAR', 'FACT#10545', 20.00, 0.00, 'Zelle', '152'),
(31, NULL, NULL, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'hyrmzzxe3', 'INGRESO PARTICULAR', 'FACT#10546', 100.00, 0.00, 'Zelle', '8'),
(32, 443, 448, NULL, '2025-10-29', 'Ingresos por Cuotas', 'TRANSF', 'uscxcs45u', 'INGRESO PARTICULAR', 'FACT#10589', 280.00, 0.00, 'Zelle', '423'),
(33, 444, 449, NULL, '2025-10-29', 'Ingresos por Cuotas', 'TRANSF', 'x7xk1u1zx', 'INGRESO PARTICULAR', 'FACT#10590', 20.00, 0.00, 'Zelle', '99'),
(34, 546, 553, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cwcerjynl', 'INGRESO PARTICULAR', 'FACT#10689', 45.00, 0.00, 'Zelle', '152'),
(35, 547, 554, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cs0vk390c', 'INGRESO PARTICULAR', 'FACT#10690', 20.00, 0.00, 'Zelle', '152'),
(36, 549, 556, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'qd0ox7xlu', 'INGRESO PARTICULAR', 'FACT#10692', 20.00, 0.00, 'Zelle', '99'),
(37, 550, 557, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wrjk8vxkx', 'INGRESO PARTICULAR', 'FACT#10693', 20.00, 0.00, 'Zelle', '99'),
(38, 551, 558, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'yzxwb72ik', 'INGRESO PARTICULAR', 'FACT#10694', 20.00, 0.00, 'Zelle', '99'),
(39, 552, 559, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wwprw8f8h', 'INGRESO PARTICULAR', 'FACT#10695', 20.00, 0.00, 'Zelle', '99'),
(40, 554, 561, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PENDIENTE', 'INGRESO PARTICULAR', 'FACT#10697', 20.00, 0.00, 'Zelle', '423'),
(41, 557, 564, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'ucwlze52r', 'INGRESO PARTICULAR', 'FACT#10700', 20.00, 0.00, 'Zelle', '423'),
(42, 558, 565, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PROPIO', 'INGRESO PARTICULAR', 'FACT#10701', 80.00, 0.00, 'Zelle', '236'),
(43, 702, 713, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO', 'INGRESO PARTICULAR', 'FACT#10845', 40.00, 0.00, 'Zelle', '236'),
(44, 703, 714, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACwa8et9wmq', 'INGRESO PARTICULAR', 'FACT#10846', 20.00, 0.00, 'Zelle', '99'),
(45, 704, 715, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACz7wl3lo07', 'INGRESO PARTICULAR', 'FACT#10847', 20.00, 0.00, 'Zelle', '99'),
(46, 705, 716, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'db842dtrw', 'INGRESO PARTICULAR', 'FACT#10848', 45.00, 0.00, 'Zelle', '152'),
(47, 705, 716, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'db842dtrw', 'INGRESO PARTICULAR', 'FACT#10848', 45.00, 0.00, 'Zelle', '152'),
(48, 704, 715, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACz7wl3lo07', 'INGRESO PARTICULAR', 'FACT#10847', 20.00, 0.00, 'Zelle', '99'),
(49, 703, 714, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACwa8et9wmq', 'INGRESO PARTICULAR', 'FACT#10846', 20.00, 0.00, 'Zelle', '99'),
(50, 702, 713, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO', 'INGRESO PARTICULAR', 'FACT#10845', 40.00, 0.00, 'Zelle', '236'),
(51, 734, 745, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'bk2rceqdn', 'INGRESO PARTICULAR', 'FACT#10876', 370.00, 0.00, 'Zelle', '142'),
(52, 737, 748, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'dsjsjcqqw', 'INGRESO PARTICULAR', 'FACT#10879', 75.00, 0.00, 'Zelle', '390'),
(53, 756, 767, NULL, '2026-03-10', 'Ingresos por Cuotas', 'TRANSF', 'caqy2r0if', 'INGRESO PARTICULAR', 'FACT#10897', 20.00, 0.00, 'Zelle', '152'),
(54, 759, 770, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'crucemarzo', 'INGRESO PARTICULAR', 'FACT#10900', 20.00, 0.00, 'Zelle', '236'),
(55, 760, 771, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'udb808a1x', 'INGRESO PARTICULAR', 'FACT#10901', 20.00, 0.00, 'Zelle', '99'),
(61, 75, 77, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'ej829zotq', 'INGRESO PARTICULAR', 'FACT#10224', 100.00, 0.00, 'Zelle', '127'),
(62, 75, 77, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'ej829zotq', 'INGRESO PARTICULAR', 'FACT#10224', 100.00, 0.00, 'Zelle', '127'),
(63, 76, 78, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'YBJ1I6AJ', 'INGRESO PARTICULAR', 'FACT#10225', 80.00, 0.00, 'Zelle', '71'),
(64, 76, 78, NULL, '2025-05-13', 'Ingresos por Cuotas', 'TRANSF', 'YBJ1I6AJ', 'INGRESO PARTICULAR', 'FACT#10225', 80.00, 0.00, 'Zelle', '71'),
(65, 87, 89, NULL, '2025-05-22', 'Ingresos por Cuotas', 'TRANSF', 'i73bp8olo', 'INGRESO PARTICULAR', 'FACT#10236', 100.00, 0.00, 'Zelle', '127'),
(66, 87, 89, NULL, '2025-05-22', 'Ingresos por Cuotas', 'TRANSF', 'i73bp8olo', 'INGRESO PARTICULAR', 'FACT#10236', 100.00, 0.00, 'Zelle', '127'),
(67, 90, 94, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'BACsraargbv1', 'INGRESO PARTICULAR', 'FACT#10239', 20.00, 0.00, 'Zelle', '99'),
(68, 90, 94, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'BACsraargbv1', 'INGRESO PARTICULAR', 'FACT#10239', 20.00, 0.00, 'Zelle', '99'),
(69, 91, 95, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'as2h1yt1b', 'INGRESO PARTICULAR', 'FACT#10240', 20.00, 0.00, 'Zelle', '152'),
(70, 91, 95, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'as2h1yt1b', 'INGRESO PARTICULAR', 'FACT#10240', 20.00, 0.00, 'Zelle', '152'),
(71, 92, 96, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'it7hes4vi', 'INGRESO PARTICULAR', 'FACT#10241', 100.00, 0.00, 'Zelle', '181'),
(72, 92, 96, NULL, '2025-05-26', 'Ingresos por Cuotas', 'TRANSF', 'it7hes4vi', 'INGRESO PARTICULAR', 'FACT#10241', 100.00, 0.00, 'Zelle', '181'),
(73, 95, 99, NULL, '2025-05-27', 'Ingresos por Cuotas', 'TRANSF', 'fznk2q53d', 'INGRESO PARTICULAR', 'FACT#10244', 100.00, 0.00, 'Zelle', '127'),
(74, 95, 99, NULL, '2025-05-27', 'Ingresos por Cuotas', 'TRANSF', 'fznk2q53d', 'INGRESO PARTICULAR', 'FACT#10244', 100.00, 0.00, 'Zelle', '127'),
(75, 102, 106, NULL, '2025-05-30', 'Ingresos por Cuotas', 'TRANSF', 'cabi6yt6x', 'INGRESO PARTICULAR', 'FACT#10251', 125.00, 0.00, 'Zelle', '125'),
(76, 102, 106, NULL, '2025-05-30', 'Ingresos por Cuotas', 'TRANSF', 'cabi6yt6x', 'INGRESO PARTICULAR', 'FACT#10251', 125.00, 0.00, 'Zelle', '125'),
(77, 142, 146, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'f1egmtoac', 'INGRESO PARTICULAR', 'FACT#10289', 20.00, 0.00, 'Zelle', '152'),
(78, 142, 146, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'f1egmtoac', 'INGRESO PARTICULAR', 'FACT#10289', 20.00, 0.00, 'Zelle', '152'),
(79, 143, 147, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO DESDE CTA.', 'INGRESO PARTICULAR', 'FACT#10290', 60.00, 0.00, 'Zelle', '236'),
(80, 143, 147, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO DESDE CTA.', 'INGRESO PARTICULAR', 'FACT#10290', 60.00, 0.00, 'Zelle', '236'),
(81, 144, 148, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'ib7pi7vms', 'INGRESO PARTICULAR', 'FACT#10291', 100.00, 0.00, 'Zelle', '127'),
(82, 144, 148, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'ib7pi7vms', 'INGRESO PARTICULAR', 'FACT#10291', 100.00, 0.00, 'Zelle', '127'),
(83, 145, 149, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'i0wh6vye4', 'INGRESO PARTICULAR', 'FACT#10292', 100.00, 0.00, 'Zelle', '127'),
(84, 145, 149, NULL, '2025-06-13', 'Ingresos por Cuotas', 'TRANSF', 'i0wh6vye4', 'INGRESO PARTICULAR', 'FACT#10292', 100.00, 0.00, 'Zelle', '127'),
(85, 153, 157, NULL, '2025-06-25', 'Ingresos por Cuotas', 'TRANSF', 'bnqmcxw43', 'INGRESO PARTICULAR', 'FACT#10300', 100.00, 0.00, 'Zelle', '127'),
(86, 153, 157, NULL, '2025-06-25', 'Ingresos por Cuotas', 'TRANSF', 'bnqmcxw43', 'INGRESO PARTICULAR', 'FACT#10300', 100.00, 0.00, 'Zelle', '127'),
(87, 216, 220, NULL, '2025-07-14', 'Ingresos por Cuotas', 'TRANSF', 'atawcs2yo', 'INGRESO PARTICULAR', 'FACT#10363', 20.00, 0.00, 'Zelle', '152'),
(88, 216, 220, NULL, '2025-07-14', 'Ingresos por Cuotas', 'TRANSF', 'atawcs2yo', 'INGRESO PARTICULAR', 'FACT#10363', 20.00, 0.00, 'Zelle', '152'),
(89, 223, 227, NULL, '2025-07-17', 'Ingresos por Cuotas', 'TRANSF', 'BACuo21dg830', 'INGRESO PARTICULAR', 'FACT#10370', 125.00, 0.00, 'Zelle', '23'),
(90, 223, 227, NULL, '2025-07-17', 'Ingresos por Cuotas', 'TRANSF', 'BACuo21dg830', 'INGRESO PARTICULAR', 'FACT#10370', 125.00, 0.00, 'Zelle', '23'),
(91, 246, 250, NULL, '2025-07-30', 'Ingresos por Cuotas', 'TRANSF', '', 'INGRESO PARTICULAR', 'FACT#10393', 237.20, 0.00, 'Efectivo Divisas', '266'),
(92, 246, 250, NULL, '2025-07-30', 'Ingresos por Cuotas', 'TRANSF', '', 'INGRESO PARTICULAR', 'FACT#10393', 237.20, 0.00, 'Efectivo Divisas', '266'),
(93, 285, 289, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'ej50jcz7u', 'INGRESO PARTICULAR', 'FACT#10432', 20.00, 0.00, 'Zelle', '152'),
(94, 285, 289, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'ej50jcz7u', 'INGRESO PARTICULAR', 'FACT#10432', 20.00, 0.00, 'Zelle', '152'),
(95, 286, 290, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'CRUCE', 'INGRESO PARTICULAR', 'FACT#10433', 40.00, 0.00, 'Zelle', '236'),
(96, 286, 290, NULL, '2025-08-11', 'Ingresos por Cuotas', 'TRANSF', 'CRUCE', 'INGRESO PARTICULAR', 'FACT#10433', 40.00, 0.00, 'Zelle', '236'),
(97, 298, 302, NULL, '2025-08-15', 'Ingresos por Cuotas', 'TRANSF', 'BACauvpjkkts', 'INGRESO PARTICULAR', 'FACT#10445', 50.00, 0.00, 'Zelle', '390'),
(98, 298, 302, NULL, '2025-08-15', 'Ingresos por Cuotas', 'TRANSF', 'BACauvpjkkts', 'INGRESO PARTICULAR', 'FACT#10445', 50.00, 0.00, 'Zelle', '390'),
(99, 398, 403, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'h4vw09vzh', 'INGRESO PARTICULAR', 'FACT#10545', 20.00, 0.00, 'Zelle', '152'),
(100, 398, 403, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'h4vw09vzh', 'INGRESO PARTICULAR', 'FACT#10545', 20.00, 0.00, 'Zelle', '152'),
(101, 399, 404, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'hyrmzzxe3', 'INGRESO PARTICULAR', 'FACT#10546', 100.00, 0.00, 'Zelle', '8'),
(102, 399, 404, NULL, '2025-09-26', 'Ingresos por Cuotas', 'TRANSF', 'hyrmzzxe3', 'INGRESO PARTICULAR', 'FACT#10546', 100.00, 0.00, 'Zelle', '8'),
(103, 443, 448, NULL, '2025-10-29', 'Ingresos por Cuotas', 'TRANSF', 'uscxcs45u', 'INGRESO PARTICULAR', 'FACT#10589', 280.00, 0.00, 'Zelle', '423'),
(104, 443, 448, NULL, '2025-10-29', 'Ingresos por Cuotas', 'TRANSF', 'uscxcs45u', 'INGRESO PARTICULAR', 'FACT#10589', 280.00, 0.00, 'Zelle', '423'),
(105, 444, 449, NULL, '2025-10-29', 'Ingresos por Cuotas', 'TRANSF', 'x7xk1u1zx', 'INGRESO PARTICULAR', 'FACT#10590', 20.00, 0.00, 'Zelle', '99'),
(106, 546, 553, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cwcerjynl', 'INGRESO PARTICULAR', 'FACT#10689', 45.00, 0.00, 'Zelle', '152'),
(107, 546, 553, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cwcerjynl', 'INGRESO PARTICULAR', 'FACT#10689', 45.00, 0.00, 'Zelle', '152'),
(108, 547, 554, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cs0vk390c', 'INGRESO PARTICULAR', 'FACT#10690', 20.00, 0.00, 'Zelle', '152'),
(109, 547, 554, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'cs0vk390c', 'INGRESO PARTICULAR', 'FACT#10690', 20.00, 0.00, 'Zelle', '152'),
(110, 548, 555, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'x7xk1u1zx', 'INGRESO PARTICULAR', 'FACT#10691', 20.00, 0.00, 'Zelle', '99'),
(111, 548, 555, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'x7xk1u1zx', 'INGRESO PARTICULAR', 'FACT#10691', 20.00, 0.00, 'Zelle', '99'),
(112, 549, 556, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'qd0ox7xlu', 'INGRESO PARTICULAR', 'FACT#10692', 20.00, 0.00, 'Zelle', '99'),
(113, 549, 556, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'qd0ox7xlu', 'INGRESO PARTICULAR', 'FACT#10692', 20.00, 0.00, 'Zelle', '99'),
(114, 550, 557, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wrjk8vxkx', 'INGRESO PARTICULAR', 'FACT#10693', 20.00, 0.00, 'Zelle', '99'),
(115, 550, 557, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wrjk8vxkx', 'INGRESO PARTICULAR', 'FACT#10693', 20.00, 0.00, 'Zelle', '99'),
(116, 551, 558, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'yzxwb72ik', 'INGRESO PARTICULAR', 'FACT#10694', 20.00, 0.00, 'Zelle', '99'),
(117, 551, 558, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'yzxwb72ik', 'INGRESO PARTICULAR', 'FACT#10694', 20.00, 0.00, 'Zelle', '99'),
(118, 552, 559, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wwprw8f8h', 'INGRESO PARTICULAR', 'FACT#10695', 20.00, 0.00, 'Zelle', '99'),
(119, 552, 559, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'wwprw8f8h', 'INGRESO PARTICULAR', 'FACT#10695', 20.00, 0.00, 'Zelle', '99'),
(120, 554, 561, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PENDIENTE', 'INGRESO PARTICULAR', 'FACT#10697', 20.00, 0.00, 'Zelle', '423'),
(121, 554, 561, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PENDIENTE', 'INGRESO PARTICULAR', 'FACT#10697', 20.00, 0.00, 'Zelle', '423'),
(122, 557, 564, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'ucwlze52r', 'INGRESO PARTICULAR', 'FACT#10700', 20.00, 0.00, 'Zelle', '423'),
(123, 557, 564, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'ucwlze52r', 'INGRESO PARTICULAR', 'FACT#10700', 20.00, 0.00, 'Zelle', '423'),
(124, 558, 565, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PROPIO', 'INGRESO PARTICULAR', 'FACT#10701', 80.00, 0.00, 'Zelle', '236'),
(125, 558, 565, NULL, '2025-12-10', 'Ingresos por Cuotas', 'TRANSF', 'PROPIO', 'INGRESO PARTICULAR', 'FACT#10701', 80.00, 0.00, 'Zelle', '236'),
(126, 702, 713, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO', 'INGRESO PARTICULAR', 'FACT#10845', 40.00, 0.00, 'Zelle', '236'),
(127, 702, 713, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'DESCUENTO', 'INGRESO PARTICULAR', 'FACT#10845', 40.00, 0.00, 'Zelle', '236'),
(128, 703, 714, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACwa8et9wmq', 'INGRESO PARTICULAR', 'FACT#10846', 20.00, 0.00, 'Zelle', '99'),
(129, 703, 714, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACwa8et9wmq', 'INGRESO PARTICULAR', 'FACT#10846', 20.00, 0.00, 'Zelle', '99'),
(130, 704, 715, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACz7wl3lo07', 'INGRESO PARTICULAR', 'FACT#10847', 20.00, 0.00, 'Zelle', '99'),
(131, 704, 715, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'BACz7wl3lo07', 'INGRESO PARTICULAR', 'FACT#10847', 20.00, 0.00, 'Zelle', '99'),
(132, 705, 716, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'db842dtrw', 'INGRESO PARTICULAR', 'FACT#10848', 45.00, 0.00, 'Zelle', '152'),
(133, 705, 716, NULL, '2026-02-26', 'Ingresos por Cuotas', 'TRANSF', 'db842dtrw', 'INGRESO PARTICULAR', 'FACT#10848', 45.00, 0.00, 'Zelle', '152'),
(134, 734, 745, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'bk2rceqdn', 'INGRESO PARTICULAR', 'FACT#10876', 370.00, 0.00, 'Zelle', '142'),
(135, 734, 745, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'bk2rceqdn', 'INGRESO PARTICULAR', 'FACT#10876', 370.00, 0.00, 'Zelle', '142'),
(136, 737, 748, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'dsjsjcqqw', 'INGRESO PARTICULAR', 'FACT#10879', 75.00, 0.00, 'Zelle', '390'),
(137, 737, 748, NULL, '2026-03-05', 'Ingresos por Cuotas', 'TRANSF', 'dsjsjcqqw', 'INGRESO PARTICULAR', 'FACT#10879', 75.00, 0.00, 'Zelle', '390'),
(138, 756, 767, NULL, '2026-03-10', 'Ingresos por Cuotas', 'TRANSF', 'caqy2r0if', 'INGRESO PARTICULAR', 'FACT#10897', 20.00, 0.00, 'Zelle', '152'),
(139, 756, 767, NULL, '2026-03-10', 'Ingresos por Cuotas', 'TRANSF', 'caqy2r0if', 'INGRESO PARTICULAR', 'FACT#10897', 20.00, 0.00, 'Zelle', '152'),
(140, 759, 770, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'crucemarzo', 'INGRESO PARTICULAR', 'FACT#10900', 20.00, 0.00, 'Zelle', '236'),
(141, 759, 770, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'crucemarzo', 'INGRESO PARTICULAR', 'FACT#10900', 20.00, 0.00, 'Zelle', '236'),
(142, 760, 771, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'udb808a1x', 'INGRESO PARTICULAR', 'FACT#10901', 20.00, 0.00, 'Zelle', '99'),
(143, 760, 771, NULL, '2026-03-12', 'Ingresos por Cuotas', 'TRANSF', 'udb808a1x', 'INGRESO PARTICULAR', 'FACT#10901', 20.00, 0.00, 'Zelle', '99');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CONCILIACION_DIVISAS`
--
ALTER TABLE `CONCILIACION_DIVISAS`
  ADD PRIMARY KEY (`ID_MOV_DIVISAS`),
  ADD KEY `ID_INGRESOS` (`ID_INGRESOS`),
  ADD KEY `ID_FACTURA` (`ID_FACTURA`),
  ADD KEY `ID_EGRESOS` (`ID_EGRESO`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CONCILIACION_DIVISAS`
--
ALTER TABLE `CONCILIACION_DIVISAS`
  MODIFY `ID_MOV_DIVISAS` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=152;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `CONCILIACION_DIVISAS`
--
ALTER TABLE `CONCILIACION_DIVISAS`
  ADD CONSTRAINT `CONCILIACION_DIVISAS_ibfk_1` FOREIGN KEY (`ID_INGRESOS`) REFERENCES `INGRESOS` (`ID_INGRESO`),
  ADD CONSTRAINT `CONCILIACION_DIVISAS_ibfk_2` FOREIGN KEY (`ID_FACTURA`) REFERENCES `FACT_CUOTAS` (`ID_FACTURA`),
  ADD CONSTRAINT `CONCILIACION_DIVISAS_ibfk_3` FOREIGN KEY (`ID_EGRESO`) REFERENCES `EGRESOS` (`ID_EGRESO`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
