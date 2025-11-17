// esusu-mobile/src/screens/AlertsScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, ScrollView, 
    ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api'; 

function AlertsScreen({ navigation, route }) {
    // Get groupId from navigation parameters
    const { groupId } = route.params || {};

    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [userInfo, setUserInfo] = useState(null);

    // Helper function to get the correct style and icon
    const getAlertProps = (type) => {
        switch (type) {
            case 'warning':
                return { style: styles.warning, textStyle: styles.warningText, iconName: "warning-outline", iconColor: '#d18f00' };
            case 'critical':
                return { style: styles.critical, textStyle: styles.criticalText, iconName: "alert-circle-outline", iconColor: '#d90429' };
            case 'notice':
                return { style: styles.notice, textStyle: styles.noticeText, iconName: "notifications-outline", iconColor: '#007bff' };
            default:
                return { style: styles.alertItem, textStyle: styles.alertHeaderText, iconName: null, iconColor: '#333' };
        }
    };

    const fetchAlerts = async () => {
        const storedUserJSON = await AsyncStorage.getItem('user');
        if (!storedUserJSON) {
            setError('You must be logged in.');
            navigation.navigate('Login');
            setLoading(false);
            return;
        }
        const user = JSON.parse(storedUserJSON);
        setUserInfo(user);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(
                `${API_BASE_URL}/alerts/group/${groupId}`,
                config
            );
            setAlerts(data);
            
        } catch (err) {
            console.error('Error fetching alerts:', err.response ? err.response.data : err.message);
            setError('Failed to load alerts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchAlerts();
        } else {
            setError('Missing Group ID.');
            setLoading(false);
        }
    }, [groupId]);

    // Helper function to format the log date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <View style={[styles.fullScreen, styles.centerContent]}>
                <ActivityIndicator size="large" color="#008f39" />
            </View>
        );
    }
    if (error) return <View style={styles.fullScreen}><Text style={styles.errorText}>Error: {error}</Text></View>;

    return (
        <SafeAreaView style={styles.fullScreen}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.pageContainer}>
                    
                    {/* Back Button (Using navigation goBack) */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={20} color="#333" />
                        <Text style={styles.backButtonText}>Back to Dashboard</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.header}>Alerts</Text>

                    {alerts.length === 0 ? (
                        <Text style={styles.noAlerts}>No new alerts.</Text>
                    ) : (
                        <View>
                            {alerts.map((alert) => {
                                const { style, textStyle, iconName, iconColor } = getAlertProps(alert.type);
                                return (
                                    <View key={alert._id} style={[styles.alertItem, style]}>
                                        <View style={styles.alertHeader}>
                                            <Ionicons name={iconName} size={20} style={styles.iconStyle} color={iconColor} />
                                            <Text style={textStyle}>
                                                {alert.type.toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text style={styles.alertMessage}>{alert.message}</Text>
                                        <Text style={styles.alertTimestamp}>
                                            Logged: {formatDate(alert.createdAt)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ----------------------------------------------------
// 2. Native Stylesheet (Equivalent to Alerts.module.css)
// ----------------------------------------------------

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 50,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    pageContainer: {
        padding: 20,
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingTop: 40,
    },

    // --- Header & Back Button ---
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    backButtonText: {
        color: '#333', 
        fontWeight: '600',
        fontSize: 14,
    },
    header: {
        fontSize: 24,
        fontWeight: '700',
        color: '#333', 
        textAlign: 'center',
        marginBottom: 30,
    },

    // --- Alert List Items ---
    alertItem: {
        padding: 15,
        marginBottom: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iconStyle: {
        marginRight: 8,
    },
    alertMessage: {
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginBottom: 5,
    },
    alertTimestamp: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'right',
    },

    // --- Type-Specific Styles (Matching your color variables) ---
    warning: {
        backgroundColor: '#fefbeb',
        borderColor: '#f7b731',
    },
    warningText: {
        color: '#d18f00', 
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    critical: {
        backgroundColor: '#fef5f5', 
        borderColor: '#d90429', 
    },
    criticalText: {
        color: '#d90429', 
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    notice: {
        backgroundColor: '#f6faff', 
        borderColor: '#007bff', 
    },
    noticeText: {
        color: '#007bff', 
        fontSize: 16,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    noAlerts: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        padding: 30,
    }
});

export default AlertsScreen;