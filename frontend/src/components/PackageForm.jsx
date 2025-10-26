import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const PackageForm = ({ package: pkg, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

  useEffect(() => {
    if (pkg) {
      setValue('name', pkg.name);
      setValue('price', pkg.price);
      setValue('is_active', pkg.is_active);
    }
  }, [pkg, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      if (pkg) {
        // Update existing package
        await axios.put(`${API_URL}/packages/${pkg.id}`, data);
      } else {
        // Create new package
        await axios.post(`${API_URL}/packages`, data);
      }
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="package-form-overlay">
      <div className="package-form-card">
        <h3>{pkg ? 'Edit Package' : 'Create New Package'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div className="form-group">
            <label htmlFor="name">Package Name</label>
            <input
              type="text"
              id="name"
              autoComplete="off"
              {...register('name', {
                required: 'Package name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name must be less than 100 characters' }
              })}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              id="price"
              step="0.01"
              autoComplete="off"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              className={errors.price ? 'error' : ''}
            />
            {errors.price && <span className="error-message">{errors.price.message}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('is_active')}
              />
              Active
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Saving...' : (pkg ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageForm;
