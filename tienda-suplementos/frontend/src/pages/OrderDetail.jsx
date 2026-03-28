import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import { formatPrice } from '../utils/formatPrice';

const statusLabelMap = {
  pending: 'Pendiente',
  processing: 'Procesando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  approved: 'Aprobado',
  paid: 'Pagado',
  failed: 'Fallido',
  declined: 'Rechazado',
  voided: 'Anulado',
  error: 'Error'
};

const statusClassMap = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-sky-100 text-sky-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-zinc-200 text-zinc-700',
  approved: 'bg-emerald-100 text-emerald-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-rose-100 text-rose-800',
  declined: 'bg-rose-100 text-rose-800',
  voided: 'bg-zinc-200 text-zinc-700',
  error: 'bg-rose-100 text-rose-800'
};

const paymentMethodLabelMap = {
  wompi: 'Tarjeta / PSE (Wompi)',
  wompi_card: 'Tarjeta (Wompi Gateway)',
  transferencia: 'Transferencia bancaria',
  efectivo: 'Pago en efectivo'
};

const normalizeStatus = (status) => (status || '').toString().trim().toLowerCase();

const getStatusLabel = (status) => statusLabelMap[normalizeStatus(status)] || status || 'No disponible';

const getStatusClass = (status) => statusClassMap[normalizeStatus(status)] || 'bg-zinc-100 text-zinc-700';

const normalizePaymentStatusForCompare = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'paid') return 'approved';
  if (normalized === 'error') return 'failed';
  return normalized;
};

const formatDateTime = (value) => {
  if (!value) return 'No disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No disponible';
  return date.toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatMoney = (value) => `$${formatPrice(Number(value || 0))} COP`;

const AddressBlock = ({ shippingAddress }) => {
  if (!shippingAddress) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5">
      <h3 className="text-lg font-semibold text-zinc-800 mb-3">Direccion de envio</h3>
      <div className="text-sm text-zinc-700 space-y-1">
        <p className="font-medium text-zinc-900">{shippingAddress.fullName || 'Cliente'}</p>
        <p>{shippingAddress.street || 'Direccion no registrada'}</p>
        {shippingAddress.addressLine2 ? <p>{shippingAddress.addressLine2}</p> : null}
        <p>
          {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ') || 'Ciudad/estado no disponible'}
        </p>
        {shippingAddress.zipCode ? <p>CP: {shippingAddress.zipCode}</p> : null}
        {shippingAddress.country ? <p>{shippingAddress.country}</p> : null}
        {(shippingAddress.phoneNumber || shippingAddress.phone) ? (
          <p className="mt-2 font-medium">Tel: {shippingAddress.phoneNumber || shippingAddress.phone}</p>
        ) : null}
      </div>
    </div>
  );
};

const CustomerBlock = ({ customerData }) => {
  if (!customerData) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5">
      <h3 className="text-lg font-semibold text-zinc-800 mb-3">Datos del cliente</h3>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-zinc-500">Nombre</p>
          <p className="font-medium text-zinc-900">{customerData.fullName || 'No disponible'}</p>
        </div>
        <div>
          <p className="text-zinc-500">Email</p>
          <p className="font-medium text-zinc-900 break-all">{customerData.email || 'No disponible'}</p>
        </div>
        <div>
          <p className="text-zinc-500">Telefono</p>
          <p className="font-medium text-zinc-900">{customerData.phoneNumber || customerData.phone || 'No disponible'}</p>
        </div>
        <div>
          <p className="text-zinc-500">Documento</p>
          <p className="font-medium text-zinc-900">
            {[customerData.legalIdType, customerData.legalId].filter(Boolean).join(' ') || 'No disponible'}
          </p>
        </div>
      </div>
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [txVerification, setTxVerification] = useState({
    loading: false,
    checkedAt: null,
    transaction: null,
    error: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}`);
        if (response.data?.success && response.data?.order) {
          setOrder(response.data.order);
          return;
        }
        setAlert({ show: true, message: 'No se pudo cargar la informacion del pedido.', type: 'error' });
      } catch (error) {
        const message = error?.response?.data?.message || 'Error cargando los detalles de la orden';
        setAlert({ show: true, message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, isAuthenticated, navigate]);

  const verifyRealtimeTransaction = useCallback(async (transactionId) => {
    if (!transactionId) return;

    try {
      setTxVerification((prev) => ({ ...prev, loading: true, error: '' }));
      const response = await api.get(`/payments/verify-transaction/${transactionId}`);

      if (response.data?.success) {
        const tx = response.data?.transaction || null;
        const updatedOrder = response.data?.order || null;

        if (updatedOrder?.paymentStatus) {
          setOrder((prev) => (prev ? { ...prev, paymentStatus: updatedOrder.paymentStatus } : prev));
        }

        setTxVerification({
          loading: false,
          checkedAt: new Date().toISOString(),
          transaction: tx,
          error: ''
        });
        return;
      }

      setTxVerification((prev) => ({
        ...prev,
        loading: false,
        checkedAt: new Date().toISOString(),
        error: response.data?.message || 'No fue posible verificar el estado real en Wompi.'
      }));
    } catch (error) {
      const message = error?.response?.data?.message || 'Error consultando estado real en Wompi.';
      setTxVerification((prev) => ({
        ...prev,
        loading: false,
        checkedAt: new Date().toISOString(),
        error: message
      }));
    }
  }, []);

  const realtimeTransactionId = order?.transaction?.wompiTransactionId || order?.wompiTransactionId || '';
  const realtimePaymentMethod = order?.paymentMethod || '';

  useEffect(() => {
    if (!order || !realtimeTransactionId || !['wompi', 'wompi_card'].includes(realtimePaymentMethod)) return;
    verifyRealtimeTransaction(realtimeTransactionId);
  }, [order, realtimeTransactionId, realtimePaymentMethod, verifyRealtimeTransaction]);

  const totals = useMemo(() => {
    const subtotal = Number(order?.subtotal || 0);
    const discount = Number(order?.discountAmount || 0);
    const shipping = Number(order?.shippingCost || 0);
    const grandTotal = Number(order?.totalAmount || 0);

    const shouldShowBreakdown = subtotal > 0 || discount > 0 || shipping > 0;

    return {
      subtotal,
      discount,
      shipping,
      grandTotal,
      shouldShowBreakdown
    };
  }, [order]);

  const statusComparison = useMemo(() => {
    const internal = normalizePaymentStatusForCompare(order?.paymentStatus);
    const realtime = normalizePaymentStatusForCompare(txVerification?.transaction?.status);
    if (!realtime) return { mismatch: false, internal, realtime };
    return { mismatch: Boolean(internal && realtime && internal !== realtime), internal, realtime };
  }, [order?.paymentStatus, txVerification?.transaction?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-zinc-600">Cargando detalle del pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert
            show={true}
            message="No fue posible cargar este pedido"
            type="error"
            onClose={() => navigate('/orders')}
          />
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a mis pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="max-w-6xl mx-auto px-4 space-y-5">
        <Alert
          show={alert.show}
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ show: false, message: '', type: 'info' })}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 sm:p-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            ← Volver a mis pedidos
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Detalle de transaccion</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
                Pedido #{order.orderNumber || order.id?.toString()?.slice(-8)?.toUpperCase()}
              </h1>
              <p className="text-sm text-zinc-600 mt-2">Creado el {formatDateTime(order.createdAt)}</p>
              <p className="text-sm text-zinc-600">Ultima actualizacion: {formatDateTime(order.updatedAt)}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.status)}`}>
                Pedido: {getStatusLabel(order.status)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.paymentStatus)}`}>
                Pago: {getStatusLabel(order.paymentStatus)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-zinc-900 mb-4">Resumen de compra</h2>

              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const image = item?.product?.images?.[0] || item?.product?.image || '';
                  return (
                    <div key={`${item?.product?.id || item?.product?.name || 'item'}-${index}`} className="flex gap-4 p-4 rounded-xl border border-zinc-100">
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 flex items-center justify-center overflow-hidden shrink-0">
                        {image ? (
                          <img src={image} alt={item?.product?.name || 'Producto'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[11px] text-zinc-500 text-center px-1">Sin imagen</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-900 break-words">{item?.product?.name || 'Producto eliminado'}</p>
                        {item?.product?.description ? (
                          <p className="text-sm text-zinc-600 mt-1 break-words">{item.product.description}</p>
                        ) : null}
                        <div className="mt-2 text-sm text-zinc-600 flex flex-wrap gap-x-4 gap-y-1">
                          <span>Tipo: {item?.kind || 'Producto'}</span>
                          <span>Cantidad: {item?.quantity || 0}</span>
                          <span>Unitario: {formatMoney(item?.price || 0)}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Subtotal</p>
                        <p className="font-semibold text-zinc-900">{formatMoney(item?.total || 0)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-zinc-100 mt-6 pt-4 space-y-2 text-sm">
                {totals.shouldShowBreakdown ? (
                  <>
                    <div className="flex justify-between text-zinc-700">
                      <span>Subtotal</span>
                      <span>{formatMoney(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-700">
                      <span>Descuento</span>
                      <span>{totals.discount > 0 ? `- ${formatMoney(totals.discount)}` : formatMoney(0)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-700">
                      <span>Envio</span>
                      <span>{totals.shipping > 0 ? formatMoney(totals.shipping) : 'Gratis'}</span>
                    </div>
                  </>
                ) : null}
                <div className="flex justify-between text-lg font-bold text-zinc-900 pt-1">
                  <span>Total pagado</span>
                  <span className="text-emerald-700">{formatMoney(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            <CustomerBlock customerData={order.customerData} />
            <AddressBlock shippingAddress={order.shippingAddress} />
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-5">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Pago y transaccion</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500">Metodo de pago</p>
                  <p className="font-medium text-zinc-900">{paymentMethodLabelMap[order.paymentMethod] || order.paymentMethod || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Estado del pago</p>
                  <p className="font-medium text-zinc-900">{getStatusLabel(order.paymentStatus)}</p>
                </div>
                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-zinc-500">Estado real en Wompi</p>
                    {['wompi', 'wompi_card'].includes(order.paymentMethod) && (order?.transaction?.wompiTransactionId || order?.wompiTransactionId) ? (
                      <button
                        type="button"
                        onClick={() => verifyRealtimeTransaction(order?.transaction?.wompiTransactionId || order?.wompiTransactionId)}
                        disabled={txVerification.loading}
                        className="text-xs px-2 py-1 rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                      >
                        {txVerification.loading ? 'Verificando...' : 'Actualizar'}
                      </button>
                    ) : null}
                  </div>

                  {txVerification.transaction ? (
                    <div className="space-y-2">
                      <p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(txVerification.transaction.status)}`}>
                          {getStatusLabel(txVerification.transaction.status)}
                        </span>
                      </p>
                      {txVerification.transaction.status_message ? (
                        <p className="text-xs text-zinc-600 break-words">{txVerification.transaction.status_message}</p>
                      ) : null}
                      {txVerification.checkedAt ? (
                        <p className="text-[11px] text-zinc-500">Verificado: {formatDateTime(txVerification.checkedAt)}</p>
                      ) : null}

                      {statusComparison.mismatch ? (
                        <div className="mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                          Hay diferencia entre estado interno ({getStatusLabel(order.paymentStatus)}) y estado real ({getStatusLabel(txVerification.transaction.status)}).
                        </div>
                      ) : (
                        <div className="mt-2 p-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                          El estado interno coincide con Wompi.
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      {txVerification.error || 'Aun no se ha verificado en tiempo real esta transaccion.'}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-zinc-500">Referencia Wompi</p>
                  <p className="font-mono text-xs break-all text-zinc-900">{order?.transaction?.wompiReference || order?.wompiReference || 'No disponible'}</p>
                </div>
                <div>
                  <p className="text-zinc-500">ID transaccion</p>
                  <p className="font-mono text-xs break-all text-zinc-900">{order?.transaction?.wompiTransactionId || order?.wompiTransactionId || 'No disponible'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
