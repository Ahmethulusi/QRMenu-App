import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const API_URL = import.meta.env.VITE_API_URL;

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

export default function TransferListModal({ open, handleClose, selectedMenuId }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [left, setLeft] = useState([]);
    const [right, setRight] = useState([]);
    const [checked, setChecked] = useState([]);
    const [registeredProducts, setRegisteredProducts] = useState([]);
    const [selectedMenuName, setSelectedMenuName] = useState('');

    useEffect(() => {
        // Kategorileri ve ürünleri fetch etmek
        async function fetchData() {
            const categoriesResponse = await fetch(`${API_URL}/api/admin/categories`); // Kategorileri fetch et
            const categoriesData = await categoriesResponse.json();
            setCategories(categoriesData);

            const productsResponse = await fetch(`${API_URL}/api/admin/products`); // Ürünleri fetch et
            const productsData = await productsResponse.json();
            setProducts(productsData);
        }
        fetchData();

    }, []);

    useEffect(() => {
        // Seçilen kategoriye göre sol listeyi güncelle
        if (selectedCategory) {
            const filteredProducts = products.filter(product => product.category_id === selectedCategory);
            setLeft(filteredProducts);
        }
    }, [selectedCategory, products]);

    useEffect(() => {
        const fetchSelectedMenu = async () => {
            const response = await fetch(`${API_URL}/api/admin/menus/${selectedMenuId}`);
            const data = await response.json();
            setSelectedMenuName(data.name);
        };
        if (selectedMenuId) {
            fetchSelectedMenu();
        }
    }, [selectedMenuId]);

   
            // Menüye kayıtlı ürünleri sağ tarafa yükle
    useEffect(() => {
        const fetchMenuProducts = async () => {
            if (selectedMenuId) {
                try {
                    const response = await fetch(`${API_URL}/api/admin/menus/getRegisteredProducts/${selectedMenuId}`);
                    const menuProducts = await response.json();

                    setRight(menuProducts); // Sağ tarafa menüdeki mevcut ürünleri ekle
                } catch (error) {
                    console.error('Kayıtlı menü ürünleri alınırken hata oluştu:', error);
                }
            }
    };
    fetchMenuProducts();
    }, [selectedMenuId]);
        
    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const handleSave = async () => {
        // Seçilen ürünleri menüye kaydet
        const response = await fetch(`${API_URL}/api/admin/menus/saveProducts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ menuId: selectedMenuId, products: right }),
        });

        if (response.ok) {
            console.log('Products saved successfully');
            handleClose();
        } else {
            console.error('Error saving products');
        }
    };

    const customList = (items) => (
        <Paper sx={{ width: 200, height: 230, overflow: 'auto' }}  style={{border: '1px solid #ccc'}}>
            <List dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-item-${value.product_id}-label`;

                    return (
                        <ListItemButton
                            key={value.product_id}
                            role="listitem"
                            onClick={handleToggle(value)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{
                                        'aria-labelledby': labelId,
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value.product_name} />
                        </ListItemButton>
                    );
                })}
            </List>
        </Paper>
    );

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle > {selectedMenuName ? selectedMenuName : 'Menu Name'}</DialogTitle>

            <DialogContent>
                <FormControl fullWidth sx={{ marginBottom: 2, marginTop: 2 }}>
                    <InputLabel>Kategori Seç</InputLabel>
                    <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="Kategori Seç"
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.category_id} value={category.category_id} style={{ color: 'black' }}>
                                {category.category_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Grid
                    container
                    spacing={2}
                    sx={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <Grid item>{customList(left)}</Grid>
                    <Grid item>
                        <Grid container direction="column" sx={{ alignItems: 'center' }}>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={handleAllRight}
                                disabled={left.length === 0}
                                aria-label="move all right"
                            >
                                ≫
                            </Button>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={handleCheckedRight}
                                disabled={leftChecked.length === 0}
                                aria-label="move selected right"
                            >
                                &gt;
                            </Button>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={handleCheckedLeft}
                                disabled={rightChecked.length === 0}
                                aria-label="move selected left"
                            >
                                &lt;
                            </Button>
                            <Button
                                sx={{ my: 0.5 }}
                                variant="outlined"
                                size="small"
                                onClick={handleAllLeft}
                                disabled={right.length === 0}
                                aria-label="move all left"
                            >
                                ≪
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item>{customList(right)}</Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleSave}>Kaydet</Button>
            </DialogActions>
        </Dialog>
    );
}
