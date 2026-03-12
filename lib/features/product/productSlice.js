import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'
import axios from 'axios'

export const fetchProducts = createAsyncThunk('product/fetchProducts',
    async (params, thunkAPI) => {
        try {
            const storeId = params?.storeId;
            const { data } = await axios.get('/api/products' + (storeId ? `?storeId=${storeId}` : ''))
            return data.products
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.error || error.message)
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: productDummyData,
        loading: false,
        error: null,
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false
                state.list = action.payload
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer