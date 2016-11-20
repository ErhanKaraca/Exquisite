import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  Platform,
  PixelRatio
} from 'react-native';

import { Spinner, Input } from './../../components/common';

const deviceWidth = require('Dimensions').get('window').width;
const deviceHeight = require('Dimensions').get('window').height;

import { Actions } from 'react-native-router-flux';
import { connect } from 'react-redux';
import * as actions from './../../actions';
import firebase from 'firebase';

import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';

// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob

const uploadImage = (uri, mime = 'application/octet-stream') => {
  const storage = firebase.storage(); //declare storage here just for this instance
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
    const sessionId = new Date().getTime()
    let uploadBlob = null
    const imageRef = storage.ref('images').child(`${sessionId}`)

    fs.readFile(uploadUri, 'base64')
      .then((data) => {
        return Blob.build(data, { type: `${mime};BASE64` })
      })
      .then((blob) => {
        uploadBlob = blob
        return imageRef.put(blob, { contentType: mime })
      })
      .then(() => {
        uploadBlob.close()
        return imageRef.getDownloadURL()
      })
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        reject(error)
    })
  })
};

class AddProduct extends Component {

  constructor(props) {
    super(props)
    this.state = {
      brand: '',
      category: '',
      color: '',
      description: '',
      imageURL: null,
      name: '',
      price: '',
      size: ''
    }
  }

  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true //disable icloud backup
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({ artworkUrl: '' })

        const source = {uri: 'data:image/jpeg;base64,' + response.data, isStatic: true};
        if (Platform.OS === 'ios') {
          const source = {uri: response.uri.replace('file://', ''), isStatic: true};
        } else {
          const source = {uri: response.uri, isStatic: true};
        }

        this.setState({ artworkUrl: '' });
        uploadImage(response.uri)
          .then(url => {
            this.setState({ artworkToUpload: url })
            this.props.storeArtwork(source);
          })
          .catch(error => {
            Alert.alert('Image uploading failed', 'Please check your internet connection')
            this.setState({ artworkUrl: null })
          });
      }
    });
  }

  render() {
    const { skeleton, centerEverything, container, textContainer, titleContainer, descContainer,
            contentContainer, title, desc, productUpperContainer, productLowerContainer, productArtworkContainer,
            productDetailContainer, propWidth, halfPropWidth } = styles;
    return(
      <View style={[centerEverything, container]}>
        <View style={[centerEverything, textContainer]}>
          <View style={titleContainer}>
            <Text style={[title]}>Add New Products</Text>
          </View>
          <View style={descContainer}>
            <Text style={[desc]}>Great journey starts here</Text>
          </View>
        </View>
        <View style={[contentContainer]}>
          <View style={[productUpperContainer]}>
            <View style={[productArtworkContainer]}>

            </View>
            <View style={[productDetailContainer]}>
              <Input
                propWidth={halfPropWidth}
                placeholder="Product Name"
                onChangeText={(name) => this.setState({ name })}
                value={this.state.name} />
              <Input
                propWidth={halfPropWidth}
                placeholder="Product Brand"
                onChangeText={(brand) => this.setState({ brand })}
                value={this.state.brand} />
              <Input
                propWidth={halfPropWidth}
                placeholder="Product Category"
                onChangeText={(category) => this.setState({ category })}
                value={this.state.category} />
              <Input
                propWidth={halfPropWidth}
                placeholder="Color Available"
                onChangeText={(color) => this.setState({ color })}
                value={this.state.color} />
              <Input
                propWidth={halfPropWidth}
                placeholder="Size Available"
                onChangeText={(size) => this.setState({ size })}
                value={this.state.size} />
              <Input
                propWidth={halfPropWidth}
                placeholder="Price"
                onChangeText={(price) => this.setState({ price })}
                value={this.state.price} />
            </View>
          </View>
          <View style={[productLowerContainer]}>
            <Input
              multiline
              propHeight={{height: 180}}
              propWidth={propWidth}
              placeholder="Some description about this product"
              onChangeText={(description) => this.setState({ description })}
              value={this.state.description} />
          </View>
        </View>
      </View>
    )
  }
}

const styles = {
  skeleton: {
    borderWidth: 1,
    borderColor: 'red'
  },
  centerEverything: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1
  },
  textContainer: {
    flex: 2,
    // height: 80,
    marginTop: 40
  },
  titleContainer: {
    width: deviceWidth*0.8,
  },
  descContainer: {
    width: deviceWidth*0.6,
  },
  contentContainer: {
    flex: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica Neue',
    fontWeight: '400',
    textAlign: 'center'
  },
  desc: {
    color: 'grey',
    fontSize: 15,
    fontFamily: 'Helvetica Neue',
    fontWeight: '300',
    textAlign: 'center'
  },
  productUpperContainer: {
    flex: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  productLowerContainer: {
    flex: 4
  },
  productArtworkContainer: {
    width: deviceWidth*0.45,
    height: 250,
    backgroundColor: '#FFF',
    borderRadius: 5,
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 2,
    margin: 5
  },
  productDetailContainer: {
    flexDirection: 'column',
    margin: 5
  },
  propWidth: {
    width: deviceWidth*0.9
  },
  halfPropWidth: {
    width: deviceWidth*0.4
  },
}

export default (AddProduct);
