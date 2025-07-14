import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFetchBlob from 'rn-fetch-blob';
import { useDocuments } from '../context/DocumentContext';
import Pdf from 'react-native-pdf';

const PreviewScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [isDownloading, setIsDownloading] = useState(false);
  const { isLoading } = useDocuments();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { config, fs } = RNFetchBlob;
      const downloadsPath = fs.dirs.DownloadDir;
      const filePath = `${downloadsPath}/${document.file.name}`;
      
      const options = {
        fileCache: true,
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: document.file.name,
          description: 'Downloading file',
          mime: document.file.type,
        },
      };
      
      const response = await config(options).fetch('GET', document.file.uri);
      
      Alert.alert(
        'Download Complete',
        `File saved to ${filePath}`,
        [{ text: 'OK', onPress: () => {} }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderPreview = () => {
    if (document.file.type.includes('pdf')) {
      return (
        <Pdf
          source={{ uri: document.file.uri, cache: true }}
          style={styles.preview}
          onError={(error) => {
            console.log(error);
            Alert.alert('Error', 'Failed to load PDF');
          }}
        />
      );
    } else if (document.file.type.includes('image')) {
      return (
        <Image
          source={{ uri: document.file.uri }}
          style={styles.preview}
          resizeMode="contain"
        />
      );
    } else {
      return (
        <View style={styles.unsupportedPreview}>
          <Icon name="error-outline" size={50} color="#95a5a6" />
          <Text style={styles.unsupportedText}>Preview not available</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{document.file.name}</Text>
        </View>
        
        <View style={styles.previewContainer}>
          {renderPreview()}
        </View>
        
        <View style={styles.documentInfo}>
          <View style={styles.infoRow}>
            <Icon name="category" size={20} color="#555" />
            <Text style={styles.infoText}>
              {document.majorHead} • {document.minorHead}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Icon name="date-range" size={20} color="#555" />
            <Text style={styles.infoText}>
              {new Date(document.documentDate).toLocaleDateString()}
            </Text>
          </View>
          
          {document.remarks && (
            <View style={styles.infoRow}>
              <Icon name="notes" size={20} color="#555" />
              <Text style={styles.infoText}>{document.remarks}</Text>
            </View>
          )}
          
          {document.tags.length > 0 && (
            <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
              <Icon name="tag" size={20} color="#555" style={styles.tagIcon} />
              <View style={styles.tagsContainer}>
                {document.tags.map((tag, index) => (
                  <Text key={index} style={styles.tag}>{tag}</Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownload}
          disabled={isLoading || isDownloading}
        >
          {isDownloading ? (
            <Text style={styles.buttonText}>Downloading...</Text>
          ) : (
            <>
              <Icon name="cloud-download" size={20} color="#fff" />
              <Text style={styles.buttonText}>Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333',
  },
  previewContainer: {
    height: 400,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
  },
  unsupportedPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unsupportedText: {
    marginTop: 10,
    color: '#95a5a6',
  },
  documentInfo: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#555',
  },
  tagIcon: {
    marginTop: 3,
  },
  tagsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  downloadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default PreviewScreen;