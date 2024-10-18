// CourseForm.jsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const CourseForm = ({ addCourse }) => {
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    duration: Yup.string().required('Required'),
    category: Yup.string().required('Required'),
  });

  return (
    <Formik
      initialValues={{ title: '', description: '', duration: '', category: '' }}
      validationSchema={validationSchema}
      onSubmit={(values, { resetForm }) => {
        addCourse(values);
        resetForm();
      }}
    >
      {({ handleChange, values, errors, touched }) => (
        <Form>
          <TextField
            label="Title"
            name="title"
            onChange={handleChange}
            value={values.title}
            error={touched.title && Boolean(errors.title)}
            helperText={touched.title && errors.title}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            onChange={handleChange}
            value={values.description}
            error={touched.description && Boolean(errors.description)}
            helperText={touched.description && errors.description}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
          <TextField
            label="Duration"
            name="duration"
            onChange={handleChange}
            value={values.duration}
            error={touched.duration && Boolean(errors.duration)}
            helperText={touched.duration && errors.duration}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={values.category}
              onChange={handleChange}
              error={touched.category && Boolean(errors.category)}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              <MenuItem value="Programming">Programming</MenuItem>
              <MenuItem value="Design">Design</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Business">Business</MenuItem>
            </Select>
            {touched.category && errors.category && (
              <div style={{ color: 'red' }}>{errors.category}</div>
            )}
          </FormControl>
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
            Add Course
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CourseForm;
