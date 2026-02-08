'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const DeliveryForm = ({ active }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: '',
    cod_amount: '',
    name: '',
    invoice: '',
    address: '',
    note: '',
    district: '',
    districtId: '',
    area: '',
    weight: '',
    exchange: false,
    partial: false,
  });

  const [districts, setDistricts] = useState([]);
  const [areas, setAreas] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch Districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const res = await fetch(
          'https://admin.merchantfcservice.com/api/distList'
        );
        const data = await res.json();
        if (data.Status) {
          setDistricts(data.data);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };
    fetchDistricts();
  }, []);

  // fetch Areas by District
  useEffect(() => {
    const fetchAreas = async () => {
      if (!formData.districtId) return;
      try {
        const res = await fetch(
          `https://admin.merchantfcservice.com/api/dist-area?id=${formData.districtId}`
        );
        const data = await res.json();
        if (data.Status) {
          setAreas(data.data);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, [formData.districtId]);

  // handle input changes
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Form validation - check if all required fields are filled and valid
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.districtId) {
      newErrors.district = 'District is required';
    }
    
    if (!formData.area) {
      newErrors.area = 'Area is required';
    }
    
    if (!formData.weight.trim()) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(formData.weight) || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }
    
    if (!formData.cod_amount.trim()) {
      newErrors.cod_amount = 'COD Amount is required';
    } else if (isNaN(formData.cod_amount) || parseFloat(formData.cod_amount) < 0) {
      newErrors.cod_amount = 'COD Amount must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return (
      formData.phone.trim() !== '' &&
      formData.name.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.districtId !== '' &&
      formData.area !== '' &&
      formData.weight.trim() !== '' &&
      formData.cod_amount.trim() !== ''
    );
  };

  // handle district change separately
  const handleDistrictChange = e => {
    const selectedIndex = e.target.selectedIndex;
    const selectedOption = e.target.options[selectedIndex];
    const id = e.target.value;
    const name = selectedOption.text;

    setFormData(prev => ({
      ...prev,
      districtId: id,
      district: name,
      area: '',
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // Prevent double submit
    if (isSubmitting) return;
    
    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const finalData = {
        customer_name: formData.name || '',
        customer_email: '',
        customer_address: formData.address,
        customer_phone: formData.phone,
        pickup_date: '',
        pckup_time: '',
        note: formData.note,
        category: '',
        weight: formData.weight,
        cod_amount: formData.cod_amount || '',
        imp: active,
        area: formData.area,
        order_id: formData.invoice,
        is_exchange: 1,
        isPartial: 1,
      };
      
      const stored = localStorage.getItem('token');
      const token = stored ? JSON.parse(stored).token : null;

      const res = await fetch(
        'https://admin.merchantfcservice.com/api/orderstor',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(finalData),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed: ${res.status}`);
      }
      
      const result = await res.json();
      toast.success('Parcel created successfully');
      router.push('/dashboard/consignments');
      
      // Reset form
      setFormData({
        phone: '',
        cod_amount: '',
        name: '',
        invoice: '',
        address: '',
        note: '',
        district: '',
        districtId: '',
        area: '',
        weight: '',
        exchange: false,
        partial: false,
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="md:p-6 space-y-4">
      {/* Phone & COD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Phone#
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Please enter a valid phone number with 11 digit"
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.phone 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            COD Amount
          </label>
          <input
            type="number"
            name="cod_amount"
            value={formData.cod_amount ?? ''}
            onChange={handleChange}
            placeholder="COD Amount"
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.cod_amount 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          />
          {errors.cod_amount && (
            <p className="mt-1 text-sm text-red-600">{errors.cod_amount}</p>
          )}
        </div>
      </div>

      {/* Name & Invoice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Type Name"
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.name 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Invoice
          </label>
          <input
            type="text"
            name="invoice"
            value={formData.invoice}
            onChange={handleChange}
            placeholder="Type Invoice"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
          />
        </div>
      </div>

      {/* Address & Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Type Address"
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.address 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          ></textarea>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Note
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Type Note"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none"
          ></textarea>
        </div>
      </div>

      {/* District & Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            District
          </label>
          <select
            name="district"
            value={formData.districtId}
            onChange={handleDistrictChange}
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.district 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          >
            <option value="">Select District</option>
            {districts.map(dist => (
              <option key={dist.id} value={dist.id}>
                {dist.name} ({dist.bn_name})
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="mt-1 text-sm text-red-600">{errors.district}</p>
          )}
        </div>

        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Area
          </label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.area 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          >
            <option value="">Select Area</option>
            {areas.map(area => (
              <option key={area.id} value={area.area}>
                {area.area}
              </option>
            ))}
          </select>
          {errors.area && (
            <p className="mt-1 text-sm text-red-600">{errors.area}</p>
          )}
        </div>
      </div>

      {/* Weight & Options */}
      <div className="">
        <div>
          <label className="block text-md font-medium text-secondary mb-1">
            Weight
          </label>
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Please enter your Weight"
            className={`w-full p-3 border rounded-md focus:outline-none ${
              errors.weight 
                ? 'border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-2 focus:ring-blue-200'
            }`}
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              name="exchange"
              checked={formData.exchange}
              onChange={handleChange}
            />
            Exchange
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="partial"
              checked={formData.partial}
              onChange={handleChange}
            />
            Partial
          </label>
        </div>
        <button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`w-3xl mx-auto button-primary cursor-pointer text-white p-2.5 px-4 rounded-md text-3xl ${
            (!isFormValid() || isSubmitting)
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:button-primary'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default DeliveryForm;
