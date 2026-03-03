/* ============================================================
   WMS ANALÍTICO — wms_config.js  [v2.0]
   Constantes globais e mapeamento de colunas
   ============================================================ */

const PAGE_SIZE  = 50;
const CRITICAL   = 200;
const WARN_MULT  = 1.5;

/**
 * REGRAS DE TRANSFERÊNCIA POR ARMAZÉM
 * ARM 1  → origem livre para qualquer CD (exceto bloqueados)
 * ARM 28 → SOMENTE entre CD 1 ARM 28 ↔ CD 6 ARM 28
 * ARM 8  → origem APENAS para cd_unidade_de_n = "1"
 */
const BLOCKED_ARMAZ_RAW = new Set([
  '0','2','8','20','21','22','23','24','25','26','27','29',
  '30','32','33','200','300','1001','9999',
  'ABAS','AMOS','HOLD','IMPO','INVE','LOJA','MTNL','PERD','PROD','QUAL','TEMP','TRAN','VENC',
]);

function normalizeArmaz(v) {
  const s = String(v ?? '').trim().toUpperCase();
  if (/^\d+$/.test(s)) return String(parseInt(s, 10));
  return s;
}

function isArmazBlocked(v) {
  return BLOCKED_ARMAZ_RAW.has(normalizeArmaz(v));
}

function isValidTransferPair(orig, dest) {
  const oArm = normalizeArmaz(orig.armaz);
  const dArm = normalizeArmaz(dest.armaz);

  if (isArmazBlocked(dest.armaz)) return false;
  if (orig.cd === dest.cd && oArm === dArm) return false;

  if (oArm === '1') return true;

  if (oArm === '8') return String(dest.cd).trim() === '1';

  if (oArm === '28') {
    if (dArm !== '28') return false;
    return (orig.cd === '1' && dest.cd === '6') ||
           (orig.cd === '6' && dest.cd === '1');
  }

  return false;
}

let ZERO_STOCK_DATA = [];

const COL_MAP = {
  cd_material:     ['cd_material','cdmaterial','codigo','code','material','cod_material'],
  desc_material:   ['descmaterial','desc_material','descricao','description','nome','desc'],
  cd:              ['cd_unidade_de_n','cd_unidade_de_negocio','cd_unidade','unidade_de_negocio','unidade_negocio','cd'],
  cd_centro_armaz: ['cd_centro_armaz','cdcentroarmaz','centro_armazenagem','centro_armaz','armazem_local','local_armaz','armaz'],
  saldo:           ['saldo','qtd','quantidade','stock','quantity','balance'],
  desc_armaz:      ['descarmaz','desc_armaz','descricao_armaz','desc_armazem','descricaoarmaz'],
  devolver:        ['devolver','qtd_devolver','return','retorno'],
};

let WMS_DATA      = [];
let TRANSFER_DATA = [];

const state = {
  estoque:  { sort: { col: null, dir: 1 }, page: 1 },
  transfer: { sort: { col: 'prioridade',  dir: 1 }, page: 1 },
  comp1:    { sort: { col: null, dir: 1 }, page: 1 },
  comp2:    { sort: { col: null, dir: 1 }, page: 1 },
};
