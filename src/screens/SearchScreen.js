import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { useDocuments } from '../context/DocumentContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';

const SearchScreen = ({ navigation }) => {
    const { searchDocuments, tags, fetchTags, isLoading } = useDocuments();

    const [majorHead, setMajorHead] = useState(null);
    const [minorHead, setMinorHead] = useState(null);
    const [minorHeadOptions, setMinorHeadOptions] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [openMajorHead, setOpenMajorHead] = useState(false);
    const [openMinorHead, setOpenMinorHead] = useState(false);
    const [openTags, setOpenTags] = useState(false);

    const majorHeadOptions = [
        { label: 'Personal', value: 'personal' },
        { label: 'Professional', value: 'professional' },
    ];

    const personalMinorHeads = [
        { label: 'John', value: 'john' },
        { label: 'Tom', value: 'tom' },
        { label: 'Emily', value: 'emily' },
        { label: 'Sarah', value: 'sarah' },
    ];

    const professionalMinorHeads = [
        { label: 'Accounts', value: 'accounts' },
        { label: 'HR', value: 'hr' },
        { label: 'IT', value: 'it' },
        { label: 'Finance', value: 'finance' },
    ];

    const tagOptions = tags.map(tag => ({ label: tag, value: tag }));

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        if (majorHead === 'personal') {
            setMinorHeadOptions(personalMinorHeads);
        } else if (majorHead === 'professional') {
            setMinorHeadOptions(professionalMinorHeads);
        } else {
            setMinorHeadOptions([]);
        }
        setMinorHead(null);
    }, [majorHead]);

    const handleFromDateChange = (event, selectedDate) => {
        setShowFromDatePicker(false);
        if (selectedDate) {
            setFromDate(selectedDate);
        }
    };

    const handleToDateChange = (event, selectedDate) => {
        setShowToDatePicker(false);
        if (selectedDate) {
            setToDate(selectedDate);
        }
    };

    const handleSearch = async () => {
        const searchParams = {
            majorHead,
            minorHead,
            tags: selectedTags,
            fromDate: fromDate?.toISOString().split('T')[0],
            toDate: toDate?.toISOString().split('T')[0],
        };

        const results = await searchDocuments(searchParams);
        setSearchResults(results);
    };

    const handleClear = () => {
        setMajorHead(null);
        setMinorHead(null);
        setSelectedTags([]);
        setFromDate(null);
        setToDate(null);
        setSearchResults([]);
    };

    const renderDocumentItem = ({ item }) => (
        <TouchableOpacity
            style={styles.documentItem}
            onPress={() => navigation.navigate('Preview', { document: item })}
        >
            <Icon
                name={item.file.type.includes('image') ? 'image' : 'picture-as-pdf'}
                size={30}
                color="#3498db"
            />
            <View style={styles.documentInfo}>
                <Text style={styles.documentName} numberOfLines={1}>{item.file.name}</Text>
                <Text style={styles.documentMeta}>
                    {item.majorHead} • {item.minorHead} • {new Date(item.documentDate).toLocaleDateString()}
                </Text>
                <View style={styles.tagsContainer}>
                    {item.tags.map((tag, index) => (
                        <Text key={index} style={styles.tag}>{tag}</Text>
                    ))}
                </View>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.searchForm}>
                <Text style={styles.title}>Search Documents</Text>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Category</Text>
                    <DropDownPicker
                        open={openMajorHead}
                        value={majorHead}
                        items={majorHeadOptions}
                        setOpen={setOpenMajorHead}
                        setValue={setMajorHead}
                        placeholder="Select category"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Sub-category</Text>
                    <DropDownPicker
                        open={openMinorHead}
                        value={minorHead}
                        items={minorHeadOptions}
                        setOpen={setOpenMinorHead}
                        setValue={setMinorHead}
                        placeholder="Select sub-category"
                        disabled={!majorHead}
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Tags</Text>
                    <DropDownPicker
                        open={openTags}
                        multiple={true}
                        min={0}
                        max={5}
                        mode="BADGE"
                        value={selectedTags}
                        items={tagOptions}
                        setOpen={setOpenTags}
                        setValue={setSelectedTags}
                        placeholder="Select tags"
                        style={styles.dropdown}
                        dropDownContainerStyle={styles.dropdownContainer}
                        badgeDotColors={['#e76f51', '#00b4d8', '#e9c46a', '#e76f51', '#8ac926', '#00b4d8', '#e9c46a']}
                    />
                </View>

                <View style={styles.dateRangeContainer}>
                    <View style={styles.dateInputContainer}>
                        <Text style={styles.label}>From Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowFromDatePicker(true)}
                        >
                            <Text>{fromDate ? fromDate.toLocaleDateString() : 'Select date'}</Text>
                            <Icon name="calendar-today" size={20} color="#555" />
                        </TouchableOpacity>
                        {showFromDatePicker && (
                            <DateTimePicker
                                value={fromDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleFromDateChange}
                            />
                        )}
                    </View>

                    <View style={styles.dateInputContainer}>
                        <Text style={styles.label}>To Date</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowToDatePicker(true)}
                        >
                            <Text>{toDate ? toDate.toLocaleDateString() : 'Select date'}</Text>
                            <Icon name="calendar-today" size={20} color="#555" />
                        </TouchableOpacity>
                        {showToDatePicker && (
                            <DateTimePicker
                                value={toDate || new Date()}
                                mode="date"
                                display="default"
                                onChange={handleToDateChange}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.button, styles.searchButton]}
                        onPress={handleSearch}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Search</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.clearButton]}
                        onPress={handleClear}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                {searchResults.length > 0 && (
                    <Text style={styles.resultsTitle}>{searchResults.length} documents found</Text>
                )}
            </ScrollView>

            {searchResults.length > 0 && (
                <FlatList
                    data={searchResults}
                    renderItem={renderDocumentItem}
                    keyExtractor={item => item.id}
                    style={styles.resultsList}
                    contentContainerStyle={styles.resultsListContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchForm: {
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    formGroup: {
        marginBottom: 15,
        zIndex: 1000, // Ensure dropdowns appear above other elements
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#555',
    },
    dropdown: {
        borderColor: '#ccc',
        borderRadius: 8,
    },
    dropdownContainer: {
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 2,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    dateInputContainer: {
        width: '48%',
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    button: {
        width: '48%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButton: {
        backgroundColor: '#3498db',
    },
    clearButton: {
        backgroundColor: '#95a5a6',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    resultsList: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    resultsListContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    documentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    documentInfo: {
        flex: 1,
        marginLeft: 15,
        marginRight: 10,
    },
    documentName: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    documentMeta: {
        fontSize: 12,
        color: '#777',
        marginBottom: 5,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        fontSize: 12,
        color: '#3498db',
        backgroundColor: '#e1f0fa',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 5,
        marginBottom: 5,
    },
});

export default SearchScreen;