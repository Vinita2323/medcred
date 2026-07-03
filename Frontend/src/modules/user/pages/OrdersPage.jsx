import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { getUser } from '../utils/storage';
import api from '../../../services/api';
import { ENDPOINTS, getImageUrl } from '../../../services/types';

export default function OrdersPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get(ENDPOINTS.MY_ORDERS);
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex-grow flex flex-col bg-[#F8FAFF] min-h-screen font-body-md pb-20">
      <header className="flex items-center gap-3 px-4 h-16 sticky top-0 z-40 bg-white border-b border-outline-variant/30 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low cursor-pointer transition-colors">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-on-surface flex-1">My Orders</h1>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-60">
            <span className="material-symbols-outlined text-6xl mb-4">shopping_bag</span>
            <p className="font-bold">No orders found</p>
            <p className="text-xs">Looks like you haven't bought anything yet.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="bg-white rounded-2xl border border-outline-variant p-4 shadow-sm space-y-4">
              <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-sm font-bold text-on-surface">{order.orderId}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${order.paymentStatus === 'success' ? 'bg-[#0A9E58]/10 text-[#0A9E58] border-[#0A9E58]/20' : 'bg-tertiary/10 text-tertiary border-tertiary/20'}`}>
                  {order.paymentStatus}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-4 items-center">
                  {order.orderType === 'medical_equipment' && order.productId?.imageUrl ? (
                    <div className="w-16 h-16 rounded-xl bg-surface-container-lowest border border-outline-variant/50 p-1 flex items-center justify-center shrink-0">
                      <img src={getImageUrl(order.productId.imageUrl)} alt={order.productName} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-2xl">
                        {order.orderType === 'membership_card' ? 'badge' : 'medical_services'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm truncate">{order.productName || order.planName || 'Order Item'}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">Qty: 1</p>
                  </div>
                  <p className="font-black text-primary">₹{order.finalAmount?.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {order.orderType === 'medical_equipment' && (
                <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between gap-3 mt-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">
                      {order.deliveryStatus === 'delivered' ? 'done_all' : order.deliveryStatus === 'shipped' ? 'local_shipping' : 'pending_actions'}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Delivery Status</p>
                      <p className={`font-bold text-xs capitalize ${order.deliveryStatus === 'delivered' ? 'text-green-600' : order.deliveryStatus === 'shipped' ? 'text-primary' : 'text-on-surface'}`}>
                        {order.deliveryStatus || 'Pending'}
                      </p>
                    </div>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="text-right border-l border-outline-variant/30 pl-3">
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Expected</p>
                      <p className="font-bold text-xs text-on-surface">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
                {order.orderType === 'medical_equipment' && (
                  <button 
                    onClick={() => setTrackingOrder(order)}
                    className="flex-1 py-2 rounded-xl border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    Track Order
                  </button>
                )}
                <button 
                  onClick={() => setInvoiceOrder(order)}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-colors cursor-pointer shadow-sm"
                >
                  View Invoice
                </button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center animate-fade-in sm:items-center sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-slide-up sm:animate-scale-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Track Order</h3>
                <p className="text-xs text-on-surface-variant font-mono">{trackingOrder.orderId}</p>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="material-symbols-outlined text-outline hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors"
              >
                close
              </button>
            </div>

            <div className="relative pl-6 space-y-6 pb-4">
              {/* Timeline Line */}
              <div className="absolute top-2 bottom-6 left-[13px] w-0.5 bg-outline-variant/50"></div>
              <div className={`absolute top-2 left-[13px] w-0.5 bg-primary ${
                trackingOrder.deliveryStatus === 'delivered' ? 'h-full' : 
                trackingOrder.deliveryStatus === 'shipped' ? 'h-[70%]' : 
                'h-[20%]'
              } transition-all duration-500 ease-in-out`}></div>

              {/* Step 1 */}
              <div className="relative z-10 flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 border-2 border-white -ml-[23px] mt-0.5">
                  <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                </div>
                <div>
                  <p className="font-bold text-sm text-on-surface">Order Placed</p>
                  <p className="text-xs text-on-surface-variant">We have received your order.</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-mono">{new Date(trackingOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`relative z-10 flex gap-4 items-start ${['shipped', 'delivered'].includes(trackingOrder.deliveryStatus) ? '' : trackingOrder.deliveryStatus === 'pending' ? '' : 'opacity-50'}`}>
                <div className={`w-6 h-6 rounded-full ${['shipped', 'delivered', 'pending'].includes(trackingOrder.deliveryStatus) ? 'bg-primary' : 'bg-surface-container-highest'} flex items-center justify-center shrink-0 border-2 border-white -ml-[23px] mt-0.5`}>
                  {['shipped', 'delivered'].includes(trackingOrder.deliveryStatus) ? (
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                  ) : trackingOrder.deliveryStatus === 'pending' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  ) : null}
                </div>
                <div>
                  <p className={`font-bold text-sm ${trackingOrder.deliveryStatus === 'pending' ? 'text-primary' : 'text-on-surface'}`}>Processing</p>
                  <p className="text-xs text-on-surface-variant">Your item is being packed and prepared for dispatch.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`relative z-10 flex gap-4 items-start ${['shipped', 'delivered'].includes(trackingOrder.deliveryStatus) ? '' : 'opacity-50'}`}>
                <div className={`w-6 h-6 rounded-full ${['shipped', 'delivered'].includes(trackingOrder.deliveryStatus) ? 'bg-primary' : 'bg-surface-container-highest'} flex items-center justify-center shrink-0 border-2 border-white -ml-[23px] mt-0.5`}>
                  {trackingOrder.deliveryStatus === 'delivered' ? (
                     <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                  ) : trackingOrder.deliveryStatus === 'shipped' ? (
                     <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  ) : null}
                </div>
                <div>
                  <p className={`font-bold text-sm ${trackingOrder.deliveryStatus === 'shipped' ? 'text-primary' : 'text-on-surface'}`}>Shipped</p>
                  <p className="text-xs text-on-surface-variant">Item has been handed over to the courier partner.</p>
                  {trackingOrder.trackingId && <p className="text-[10px] bg-surface-container-high px-2 py-1 mt-1 rounded inline-block text-on-surface font-mono">AWB: {trackingOrder.trackingId}</p>}
                </div>
              </div>

              {/* Step 4 */}
              <div className={`relative z-10 flex gap-4 items-start ${trackingOrder.deliveryStatus === 'delivered' ? '' : 'opacity-50'}`}>
                <div className={`w-6 h-6 rounded-full ${trackingOrder.deliveryStatus === 'delivered' ? 'bg-primary' : 'bg-surface-container-highest'} border-2 border-white flex items-center justify-center shrink-0 -ml-[23px] mt-0.5`}>
                  {trackingOrder.deliveryStatus === 'delivered' && (
                     <span className="material-symbols-outlined text-white text-[12px] font-bold">check</span>
                  )}
                </div>
                <div>
                  <p className={`font-bold text-sm ${trackingOrder.deliveryStatus === 'delivered' ? 'text-primary' : 'text-on-surface'}`}>Delivered</p>
                  <p className="text-xs text-on-surface-variant">Expected by {new Date(trackingOrder.estimatedDelivery).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full mt-4 py-3 bg-surface-container-low text-on-surface font-bold rounded-xl hover:bg-surface-container cursor-pointer transition-colors"
            >
              Close Tracking
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm flex items-end justify-center animate-fade-in sm:items-center sm:p-4">
          <div id="invoice-modal" className="bg-[#F8FAFF] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-up sm:animate-scale-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-black text-xl text-on-surface">Tax Invoice</h3>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold mt-1">MedCred India Pvt. Ltd.</p>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="material-symbols-outlined text-outline hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors -mt-2 -mr-2 no-print"
              >
                close
              </button>
            </div>

            <div className="overflow-y-auto flex-grow -mx-6 px-6 pb-4">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[#E5E7EB] text-xs">
                  <div>
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Invoice To</p>
                    <p className="font-bold text-on-surface">{user?.fullName || 'Customer'}</p>
                    <p className="text-on-surface-variant leading-relaxed break-words pr-2">{invoiceOrder.deliveryAddress || 'Address not provided'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-wider mb-1">Order Details</p>
                    <p className="font-mono font-bold text-on-surface mb-0.5">{invoiceOrder.orderId}</p>
                    <p className="text-on-surface-variant font-mono">{new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {(() => {
                  const calculatedDiscount = invoiceOrder.discountAmount > 0 
                    ? invoiceOrder.discountAmount 
                    : (invoiceOrder.baseAmount > invoiceOrder.finalAmount ? invoiceOrder.baseAmount - invoiceOrder.finalAmount : 0);

                  return (
                    <>
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-start">
                          <div className="pr-4">
                            <p className="font-bold text-sm text-on-surface leading-tight">{invoiceOrder.productName || invoiceOrder.planName || 'Item'}</p>
                            <p className="text-[10px] text-on-surface-variant mt-0.5">Qty: 1 × ₹{invoiceOrder.baseAmount?.toLocaleString()}</p>
                          </div>
                          <p className="font-black text-on-surface whitespace-nowrap">₹{invoiceOrder.baseAmount?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-xs">
                        <div className="flex justify-between text-on-surface-variant">
                          <span>Subtotal</span>
                          <span className="font-bold text-on-surface">₹{invoiceOrder.baseAmount?.toLocaleString()}</span>
                        </div>
                        {calculatedDiscount > 0 && (
                          <div className="flex justify-between text-on-surface-variant">
                            <span>Discount</span>
                            <span className="font-bold text-[#0A9E58]">-₹{calculatedDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        {invoiceOrder.orderType === 'medical_equipment' && (
                          <div className="flex justify-between text-on-surface-variant">
                            <span>Shipping</span>
                            <span className="font-bold text-[#0A9E58]">FREE</span>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E7EB] p-4 shadow-sm flex justify-between items-center">
                <span className="font-bold text-sm text-on-surface uppercase tracking-wider">Total Amount</span>
                <span className="font-black text-xl text-primary">₹{invoiceOrder.finalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] mt-auto no-print">
              <button
                onClick={() => {
                  const element = document.getElementById('printable-invoice');

                  const opt = {
                    margin:       [0.4, 0],
                    filename:     `Tax-Invoice-${invoiceOrder.orderId}.pdf`,
                    image:        { type: 'jpeg', quality: 0.98 },
                    html2canvas:  { scale: 2, useCORS: true },
                    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
                  };

                  html2pdf().from(element).set(opt).save();
                }}
                className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden A4 Printable Invoice Template */}
      {invoiceOrder && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          <div id="printable-invoice" className="bg-white w-[800px] p-12 text-[#374151] font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#E5E7EB] pb-8 mb-8">
              <div>
                <img src="/FinalLogo.png" alt="MedCred Logo" className="h-16 object-contain" />
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-black text-[#111827] uppercase">Tax Invoice</h2>
                <p className="text-sm font-semibold text-[#6B7280] mt-2">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm font-semibold text-[#6B7280]">Order ID: {invoiceOrder.orderId}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="flex justify-between mb-12">
              <div className="w-1/2">
                <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Billed To:</h3>
                <p className="text-lg font-bold text-[#111827]">{invoiceOrder.userId?.fullName || invoiceOrder.userId?.name || user?.fullName || 'Customer'}</p>
                <p className="text-sm text-[#4B5563] mt-1 leading-relaxed max-w-[250px]">{invoiceOrder.deliveryAddress || 'Address not provided'}</p>
              </div>
              <div className="w-1/2 text-right">
                <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Order Date:</h3>
                <p className="text-lg font-bold text-[#111827]">{new Date(invoiceOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left mb-12 border-collapse">
              <thead>
                <tr className="border-y-2 border-[#E5E7EB]">
                  <th className="py-4 font-bold text-[#9CA3AF] uppercase text-xs tracking-wider">Item Description</th>
                  <th className="py-4 font-bold text-[#9CA3AF] uppercase text-xs tracking-wider text-center">Qty</th>
                  <th className="py-4 font-bold text-[#9CA3AF] uppercase text-xs tracking-wider text-right">Price</th>
                  <th className="py-4 font-bold text-[#9CA3AF] uppercase text-xs tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#E5E7EB]">
                  <td className="py-6 font-bold text-[#111827] text-lg">{invoiceOrder.productName || invoiceOrder.planName || 'Item'}</td>
                  <td className="py-6 font-medium text-[#4B5563] text-center text-lg">1</td>
                  <td className="py-6 font-medium text-[#4B5563] text-right text-lg">₹{invoiceOrder.baseAmount?.toLocaleString()}</td>
                  <td className="py-6 font-black text-[#111827] text-right text-lg">₹{invoiceOrder.baseAmount?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-1/2">
                <div className="space-y-4">
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-[#6B7280]">Subtotal</span>
                    <span className="font-bold text-[#111827]">₹{invoiceOrder.baseAmount?.toLocaleString()}</span>
                  </div>
                  
                  {(() => {
                    const discount = invoiceOrder.discountAmount > 0 
                      ? invoiceOrder.discountAmount 
                      : (invoiceOrder.baseAmount > invoiceOrder.finalAmount ? invoiceOrder.baseAmount - invoiceOrder.finalAmount : 0);
                    
                    if (discount > 0) {
                      return (
                        <div className="flex justify-between text-base">
                          <span className="font-semibold text-[#6B7280]">Discount</span>
                          <span className="font-bold text-[#059669]">-₹{discount.toLocaleString()}</span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {invoiceOrder.orderType === 'medical_equipment' && (
                    <div className="flex justify-between text-base">
                      <span className="font-semibold text-[#6B7280]">Shipping</span>
                      <span className="font-bold text-[#059669]">FREE</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center border-t-2 border-[#111827] pt-4 mt-4">
                    <span className="font-black text-xl text-[#111827] uppercase">Total Amount</span>
                    <span className="font-black text-3xl text-[#0A4DBF]">₹{invoiceOrder.finalAmount?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-24 pt-8 border-t border-[#E5E7EB] text-center text-sm font-medium text-[#9CA3AF]">
              <p>Thank you for choosing MedCred.</p>
              <p className="mt-1">This is a computer-generated invoice and does not require a physical signature.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
