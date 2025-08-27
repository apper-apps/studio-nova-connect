import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/components/atoms/Modal";
import toast from "@/utils/toast";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import FormField from "@/components/molecules/FormField";
import Label from "@/components/atoms/Label";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import orderLineItemService from "@/services/api/orderLineItemService";
import orderService from "@/services/api/orderService";

const OrderSidebar = ({ 
  isOpen, 
  onToggle, 
  products = [], 
  orderItems = [],
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  salesTaxRate = 8.5,
  onSalesTaxChange,
  className,
  clientId,
  galleryId 
}) => {
const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState("Sitting Fee");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentDescription, setAdjustmentDescription] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Payment tracking states
  const [paymentStatus, setPaymentStatus] = useState("Deposit Taken");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  
  // Invoice generation states
  const [studioName] = useState("ZenSales Photography Studio");
  const [studioAddress] = useState("123 Creative Lane, Photo City, PC 12345");
  const [studioPhone] = useState("(555) 123-PHOTO");
  const [studioEmail] = useState("studio@zensales.com");

  const selectedProductData = products.find(p => p.Id === selectedProduct || p.id === selectedProduct);
  const selectedSizeData = selectedProductData?.sizes?.find(s => s.size === selectedSize);

  const totals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      if (item.lineItemType === "Discount") {
        return sum - Math.abs(item.unitPrice * item.quantity);
      }
      return sum + (item.unitPrice * item.quantity);
    }, 0);
    const tax = Math.max(0, subtotal * (salesTaxRate / 100));
    const total = subtotal + tax;
    
    return { subtotal, tax, total };
  }, [orderItems, salesTaxRate]);

  const handleAddItem = () => {
    if (!selectedProduct || !selectedSize || quantity < 1) return;

    const product = products.find(p => p.Id === selectedProduct || p.id === selectedProduct);
    const size = product.sizes.find(s => s.size === selectedSize);

    // Get thumbnail URL from first available image or placeholder
    const thumbnailUrl = "/api/placeholder/100/100"; // In production, this would be the actual image thumbnail

    onAddItem({
      productId: selectedProduct,
      productName: product.Name || product.name,
      size: selectedSize,
      quantity: quantity,
      unitPrice: size.price,
      thumbnailUrl,
      specialRequests: specialRequests.trim(),
      lineItemType: "Product",
      description: `${product.Name || product.name} - ${selectedSize}`
    });

    // Reset form
    setSelectedProduct("");
    setSelectedSize("");
    setQuantity(1);
    setSpecialRequests("");
    toast.success("Item added to order");
  };

  const handleAddAdjustment = () => {
    if (!adjustmentAmount || !adjustmentDescription.trim()) {
      toast.error("Please fill in all adjustment fields");
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount === 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAddItem({
      productId: null,
      productName: adjustmentType,
      size: "",
      quantity: 1,
      unitPrice: adjustmentType === "Discount" ? -Math.abs(amount) : Math.abs(amount),
      thumbnailUrl: "",
      specialRequests: "",
      lineItemType: adjustmentType,
      description: adjustmentDescription.trim()
    });

    setAdjustmentAmount("");
    setAdjustmentDescription("");
    setShowAdjustmentModal(false);
    toast.success(`${adjustmentType} added to order`);
  };

const generateInvoicePDF = async () => {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoiceDate = new Date().toLocaleDateString();
    const balanceDue = totals.total - (parseFloat(amountPaid) || 0);
    
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      studio: {
        name: studioName,
        address: studioAddress,
        phone: studioPhone,
        email: studioEmail
      },
      client: clientId ? `Client ID: ${clientId}` : "Walk-in Client",
      items: orderItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.unitPrice * item.quantity,
        thumbnail: item.thumbnailUrl,
        specialRequests: item.specialRequests,
        type: item.lineItemType
      })),
      subtotal: totals.subtotal,
      tax: totals.tax,
      total: totals.total,
      payment: {
        status: paymentStatus,
        amountPaid: parseFloat(amountPaid) || 0,
        method: paymentMethod
      },
      balanceDue: balanceDue
    };

    // Save invoice record to database
    try {
      const invoiceService = (await import('@/services/api/invoiceService')).default;
      
      const invoiceRecord = await invoiceService.create({
        Name: `Invoice for Order ${Date.now()}`,
        invoice_number_c: invoiceNumber,
        client_c: clientId || 1,
        invoice_date_c: new Date().toISOString().split('T')[0],
        due_date_c: invoiceService.calculateDueDate(),
        total_amount_c: totals.total,
        status_c: balanceDue <= 0 ? "Paid" : "Unpaid",
        payments_received_c: parseFloat(amountPaid) || 0,
        balance_due_c: balanceDue,
        file_path_c: `Invoice-${invoiceNumber}.html`,
        legal_clause_c: "All sales are final. Digital files are delivered within 2-3 business days of full payment. Print orders require 5-7 business days for processing. Client is responsible for any applicable taxes. By signing below, client agrees to these terms and conditions."
      });
      
      console.log('Invoice record created:', invoiceRecord);
    } catch (error) {
      console.error('Failed to save invoice record:', error);
      // Continue with file generation even if database save fails
    }

    // Generate HTML content for the invoice
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background-color: #ffffff;
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #4a90e2; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-radius: 8px;
          }
          .studio-info { 
            color: #4a90e2; 
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .studio-details {
            font-size: 14px;
            color: #666;
          }
          .invoice-details { 
            margin-bottom: 30px; 
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4a90e2;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #4a90e2;
            margin-bottom: 15px;
          }
          .line-items { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .line-items th, .line-items td { 
            border: 1px solid #e9ecef; 
            padding: 15px 12px; 
            text-align: left; 
          }
          .line-items th { 
            background-color: #4a90e2; 
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .line-items tbody tr:nth-child(even) {
            background-color: #f8f9fa;
          }
          .thumbnail { 
            width: 60px; 
            height: 60px; 
            object-fit: cover; 
            border-radius: 6px; 
            border: 2px solid #e9ecef;
          }
          .totals { 
            text-align: right; 
            margin-bottom: 30px; 
          }
          .totals table { 
            margin-left: auto; 
            border-collapse: collapse;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .totals td {
            padding: 12px 20px;
            border: 1px solid #e9ecef;
          }
          .totals .total-row {
            background-color: #4a90e2;
            color: white;
            font-weight: bold;
            font-size: 16px;
          }
          .payment-info { 
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
            border-left: 4px solid #2196f3;
          }
          .payment-info h3 {
            color: #1976d2;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .legal { 
            font-size: 12px; 
            color: #666; 
            border-top: 2px solid #e9ecef; 
            padding-top: 20px; 
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .legal h4 {
            color: #4a90e2;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .signature { 
            margin-top: 40px; 
            text-align: center;
            background-color: white;
            padding: 30px;
            border: 2px dashed #4a90e2;
            border-radius: 8px;
          }
          .signature-line {
            border-top: 2px solid #333; 
            width: 300px; 
            margin: 40px auto 10px auto;
          }
          .signature strong {
            color: #4a90e2;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          @media print {
            body { padding: 0; }
            .signature { border: 2px solid #4a90e2; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="studio-info">${invoiceData.studio.name}</h1>
          <div class="studio-details">
            <p>${invoiceData.studio.address}<br>
            ${invoiceData.studio.phone} | ${invoiceData.studio.email}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <h2 class="invoice-title">INVOICE #${invoiceData.invoiceNumber}</h2>
          <p><strong>Date:</strong> ${invoiceData.date}</p>
          <p><strong>Client:</strong> ${invoiceData.client}</p>
          <p><strong>Due Date:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
        </div>

        <table class="line-items">
          <thead>
            <tr>
              <th>Image</th>
              <th>Description</th>
              <th>Special Requests</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td style="text-align: center;">${item.thumbnail ? `<img src="${item.thumbnail}" class="thumbnail" alt="Product">` : '<div style="width:60px;height:60px;background:#f0f0f0;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#666;">No Image</div>'}</td>
                <td><strong>${item.description}</strong></td>
                <td>${item.specialRequests || '-'}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;"><strong>$${item.total.toFixed(2)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table>
            <tr><td>Subtotal:</td><td style="text-align: right;">$${invoiceData.subtotal.toFixed(2)}</td></tr>
            <tr><td>Tax (${salesTaxRate}%):</td><td style="text-align: right;">$${invoiceData.tax.toFixed(2)}</td></tr>
            <tr class="total-row">
              <td><strong>Total:</strong></td><td style="text-align: right;"><strong>$${invoiceData.total.toFixed(2)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="payment-info">
          <h3>💳 Payment Information</h3>
          <p><strong>Status:</strong> ${invoiceData.payment.status}</p>
          <p><strong>Amount Paid:</strong> $${invoiceData.payment.amountPaid.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${invoiceData.payment.method}</p>
          <p><strong>Balance Due:</strong> <span style="color: ${invoiceData.balanceDue > 0 ? '#e74c3c' : '#27ae60'}; font-weight: bold;">$${invoiceData.balanceDue.toFixed(2)}</span></p>
        </div>

        <div class="legal">
          <h4>📋 Terms and Conditions</h4>
          <p>All sales are final. Digital files are delivered within 2-3 business days of full payment. 
          Print orders require 5-7 business days for processing. Client is responsible for any applicable 
          taxes. Late payments may incur additional fees. This invoice is valid for 30 days from the date of issue. 
          By signing below, client agrees to these terms and conditions and acknowledges receipt of services/products.</p>
        </div>

        <div class="signature">
          <p style="margin-bottom: 20px; color: #666;">By signing below, you acknowledge receipt of services and agree to the terms and conditions:</p>
          <div class="signature-line"></div>
          <strong>Client Signature & Date</strong>
        </div>
      </body>
      </html>
    `;

    // Create and download the invoice
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `Invoice-${invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Professional invoice generated and downloaded! Invoice record saved to database.");
    setShowInvoiceModal(false);
  };

  const handleCompleteOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Cannot complete empty order");
      return;
    }

    try {
      setProcessing(true);

      // Create order record
      const orderData = {
        name: `Order ${Date.now()}`,
        client_c: clientId,
        order_date_c: new Date().toISOString().split('T')[0],
        total_value_c: totals.total
      };

      const createdOrder = await orderService.create(orderData);

      if (createdOrder) {
        // Create order line items
        const lineItemsData = orderItems.map(item => ({
          name: item.description,
          order_c: createdOrder.Id,
          product_c: item.productId,
          quantity_c: item.quantity,
          price_c: item.unitPrice,
          thumbnail_url_c: item.thumbnailUrl || "",
          special_requests_c: item.specialRequests || "",
          line_item_type_c: item.lineItemType || "Product",
          description_c: item.description,
          value_c: item.unitPrice * item.quantity
        }));

        await orderLineItemService.createBulk(lineItemsData);

        toast.success("Order completed successfully!");
        
        // Generate invoice automatically
        generateInvoicePDF();
      }
    } catch (error) {
      toast.error("Failed to complete order");
      console.error("Error completing order:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
        className="fixed right-6 top-20 z-40 lg:hidden"
        size="sm"
      >
        <ApperIcon name="ShoppingCart" size={16} />
      </Button>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-30 overflow-y-auto",
              "lg:relative lg:shadow-none lg:border-l-0 lg:w-80",
              className
            )}
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Order Form</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="lg:hidden"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>

              {/* Add Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Product</Label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => {
                        setSelectedProduct(e.target.value);
                        setSelectedSize("");
                      }}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                    >
                      <option value="">Select Product</option>
{products.map(product => (
                        <option key={product.Id || product.id} value={product.Id || product.id}>
                          {product.Name || product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedProductData && (
                    <div>
                      <Label>Size</Label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
                      >
                        <option value="">Select Size</option>
                        {selectedProductData.sizes.map(size => (
                          <option key={size.size} value={size.size}>
                            {size.size} - ${size.price.toFixed(2)}
                          </option>
))}
                      </select>
                    </div>
                  )}

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <Label>Special Requests</Label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g., B&W, Sepia tone, Custom cropping..."
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20 text-sm"
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleAddItem}
                    disabled={!selectedProduct || !selectedSize}
                    className="w-full"
                  >
                    Add to Order
                  </Button>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No items added yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-start gap-3">
                            {item.thumbnailUrl && (
                              <img
                                src={item.thumbnailUrl}
                                alt="Product thumbnail"
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary truncate">
                                  {item.productName}
                                  {item.lineItemType !== "Product" && (
                                    <span className="ml-2 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
                                      {item.lineItemType}
                                    </span>
                                  )}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveItem(index)}
                                  className="w-6 h-6 p-0 text-error hover:text-error ml-2"
                                >
                                  <ApperIcon name="X" size={14} />
                                </Button>
                              </div>
                              <p className="text-xs text-gray-600">
                                {item.size && `${item.size} × `}{item.quantity}
                              </p>
                              {item.specialRequests && (
                                <p className="text-xs text-accent mt-1 font-medium">
                                  Special: {item.specialRequests}
                                </p>
                              )}
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">
                                  ${item.unitPrice.toFixed(2)} each
                                </span>
                                <span className="text-sm font-medium">
                                  ${(item.unitPrice * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Sales Tax (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      value={salesTaxRate}
                      onChange={(e) => onSalesTaxChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({salesTaxRate}%):</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                      <span>Total:</span>
                      <span>${totals.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAdjustmentModal(true)}
                      className="w-full"
                    >
                      <ApperIcon name="Plus" size={14} className="mr-1" />
                      Add Fee/Discount
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentModal(true)}
                      disabled={orderItems.length === 0}
                      className="w-full"
                    >
                      <ApperIcon name="CreditCard" size={14} className="mr-1" />
                      Record Payment
                    </Button>

                    <Button
                      onClick={() => setShowInvoiceModal(true)}
                      disabled={orderItems.length === 0}
                      className="w-full"
                    >
                      <ApperIcon name="FileText" size={14} className="mr-1" />
                      Generate Invoice
                    </Button>

                    <Button 
                      onClick={handleCompleteOrder}
                      disabled={orderItems.length === 0 || processing}
                      className="w-full bg-success hover:bg-success/90"
                    >
                      {processing ? (
                        <>
                          <ApperIcon name="Loader" size={14} className="mr-1 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ApperIcon name="Check" size={14} className="mr-1" />
                          Complete Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}
{/* Order Adjustment Modal */}
      <Modal isOpen={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)}>
        <ModalHeader>
          <ModalTitle>Add Order Adjustment</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div>
            <Label>Adjustment Type</Label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="Sitting Fee">Sitting Fee</option>
              <option value="Discount">Discount</option>
            </select>
          </div>
          
          <FormField
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={adjustmentAmount}
            onChange={(e) => setAdjustmentAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          
          <FormField
            label="Description"
            value={adjustmentDescription}
            onChange={(e) => setAdjustmentDescription(e.target.value)}
            placeholder="e.g., Session fee, Holiday discount"
            required
          />
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddAdjustment}>
            Add {adjustmentType}
          </Button>
        </ModalFooter>
      </Modal>

{/* Payment Recording Modal */}

      {/* Payment Recording Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
        <ModalHeader>
          <ModalTitle>Record Payment</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div>
            <Label>Payment Status</Label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="Deposit Taken">Deposit Taken</option>
              <option value="Paid In Full">Paid In Full</option>
              <option value="Payment Plan">Payment Plan</option>
            </select>
          </div>
          
          <FormField
            label="Amount Paid"
            type="number"
            step="0.01"
            min="0"
            max={totals.total}
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            placeholder="0.00"
          />
          
          <div>
            <Label>Payment Method</Label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Check">Check</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Order Total:</span>
              <span>${totals.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount Paid:</span>
              <span>${(parseFloat(amountPaid) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium border-t pt-2 mt-2">
              <span>Balance Due:</span>
              <span>${(totals.total - (parseFloat(amountPaid) || 0)).toFixed(2)}</span>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            setShowPaymentModal(false);
            toast.success("Payment information recorded");
          }}>
            Record Payment
          </Button>
        </ModalFooter>
      </Modal>

      {/* Invoice Generation Modal */}
      <Modal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} size="lg">
        <ModalHeader>
          <ModalTitle>Generate Professional Invoice</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Studio Information</h4>
              <p className="text-sm text-gray-600">{studioName}</p>
              <p className="text-sm text-gray-600">{studioAddress}</p>
              <p className="text-sm text-gray-600">{studioPhone} | {studioEmail}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items:</span>
                  <span>{orderItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {paymentStatus && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span>{paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>${(parseFloat(amountPaid) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Method:</span>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
            Cancel
          </Button>
          <Button onClick={generateInvoicePDF}>
            <ApperIcon name="Download" size={14} className="mr-1" />
            Download Invoice
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default OrderSidebar;