import React, { createContext, useState, useContext } from 'react';
import { API } from '../services/api';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTags = async (term = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.documents.getTags(term);
      if (response.data.success) {
        const tagNames = response.data.tags.map(tag => tag.tag_name);
        setTags(tagNames);
        setIsLoading(false);
        return tagNames;
      } else {
        throw new Error(response.data.message || 'Failed to fetch tags');
      }
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
      return [];
    }
  };

  const uploadDocument = async (documentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      
      // Append file
      formData.append('file', {
        uri: documentData.file.uri,
        type: documentData.file.type,
        name: documentData.file.name,
      });
      
      // Append metadata
      formData.append('data', JSON.stringify({
        major_head: documentData.majorHead,
        minor_head: documentData.minorHead,
        document_date: documentData.documentDate,
        document_remarks: documentData.remarks,
        tags: documentData.tags.map(tag => ({ tag_name: tag })),
        user_id: 'current_user_id', // You'll need to get this from your auth context
      }));
      
      const response = await API.documents.upload(formData);
      if (response.data.success) {
        const newDocument = response.data.document;
        setDocuments(prev => [...prev, newDocument]);
        setIsLoading(false);
        return newDocument;
      } else {
        throw new Error(response.data.message || 'Failed to upload document');
      }
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
      return null;
    }
  };

  const searchDocuments = async (searchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedParams = {
        major_head: searchParams.majorHead || '',
        minor_head: searchParams.minorHead || '',
        from_date: searchParams.fromDate || '',
        to_date: searchParams.toDate || '',
        tags: searchParams.tags.map(tag => ({ tag_name: tag })),
        start: 0,
        length: 10,
      };
      
      const response = await API.documents.search(formattedParams);
      if (response.data.success) {
        const results = response.data.documents;
        setIsLoading(false);
        return results;
      } else {
        throw new Error(response.data.message || 'Failed to search documents');
      }
    } catch (err) {
      setError(handleApiError(err));
      setIsLoading(false);
      return [];
    }
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        tags,
        isLoading,
        error,
        fetchTags,
        uploadDocument,
        searchDocuments,
      }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => useContext(DocumentContext);