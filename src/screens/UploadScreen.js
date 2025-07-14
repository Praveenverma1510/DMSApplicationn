import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useDocuments } from '../context/DocumentContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from '@react-native-documents/picker';
import RNFetchBlob from 'rn-fetch-blob';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

const UploadScreen = ({ navigation }) => {
  const { uploadDocument, fetchTags, addTag, tags, isLoading } = useDocuments();
  
  const [documentDate, setDocumentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [majorHead, setMajorHead] = useState(null);
  const [minorHead, setMinorHead] = useState(null);
  const [minorHeadOptions, setMinorHeadOptions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [remarks, setRemarks] = useState('');
  const [file, setFile] = useState(null);
  const [openMajorHead, setOpenMajorHead] = useState(false);
  const [openMinorHead, setOpenMinorHead] = useState(false);

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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDocumentDate(selectedDate);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      if (!tags.includes(newTag.trim())) {
        addTag(newTag.trim());
      }
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      
      setFile({
        name: res.name,
        type: res.type,
        uri: res.uri,
        size: res.size,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const takePhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const photo = response.assets[0];
        setFile({
          name: `photo_${Date.now()}.jpg`,
          type: 'image/jpeg',
          uri: photo.uri,
          size: photo.fileSize,
        });
      }
    });
  };

  const selectPhoto = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage);
      } else {
        const photo = response.assets[0];
        setFile({
          name: photo.fileName || `image_${Date.now()}.jpg`,
          type: photo.type || 'image/jpeg',
          uri: photo.uri,
          size: photo.fileSize,
        });
      }
    });
  };

// Update the handleSubmit function:

const handleSubmit = async () => {
  if (!majorHead) {
    Alert.alert('Error', 'Please select a category');
    return;
  }
  
  if (!minorHead) {
    Alert.alert('Error', 'Please select a sub-category');
    return;
  }
  
  if (!file) {
    Alert.alert('Error', 'Please select a file to upload');
    return;
  }
  
  const documentData = {
    majorHead,
    minorHead,
    tags: selectedTags,
    remarks,
    documentDate: documentDate.toISOString().split('T')[0],
    file,
  };
  
  const result = await uploadDocument(documentData);
  if (result) {
    Alert.alert('Success', 'Document uploaded successfully');
    navigation.goBack();
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Upload Document</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Document Date</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{documentDate.toLocaleDateString()}</Text>
          <Icon name="calendar-today" size={20} color="#555" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={documentDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      
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
        <View style={styles.tagsContainer}>
          {selectedTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add tag"
            value={newTag}
            onChangeText={setNewTag}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.hint}>Existing tags: {tags.join(', ')}</Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          placeholder="Enter any remarks"
          value={remarks}
          onChangeText={setRemarks}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Document</Text>
        {file ? (
          <View style={styles.fileInfo}>
            <Icon name="insert-drive-file" size={24} color="#555" />
            <Text style={styles.fileName}>{file.name}</Text>
            <TouchableOpacity onPress={() => setFile(null)}>
              <Icon name="close" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.fileButtons}>
            <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
              <Icon name="attach-file" size={24} color="#fff" />
              <Text style={styles.fileButtonText}>Select File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fileButton} onPress={selectPhoto}>
              <Icon name="photo-library" size={24} color="#fff" />
              <Text style={styles.fileButtonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fileButton} onPress={takePhoto}>
              <Icon name="camera-alt" size={24} color="#fff" />
              <Text style={styles.fileButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.hint}>Supported formats: PDF, JPG, PNG</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.submitButtonText}>Uploading...</Text>
        ) : (
          <Text style={styles.submitButtonText}>Upload Document</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
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
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 2,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    marginRight: 5,
    fontSize: 12,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  tagInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  addTagButton: {
    width: 40,
    height: 40,
    backgroundColor: '#3498db',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  fileName: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  fileButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fileButton: {
    flex: 1,
    marginHorizontal: 5,
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  fileButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UploadScreen;