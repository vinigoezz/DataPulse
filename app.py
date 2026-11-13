import streamlit as st

st.set_page_config(page_title="DataPulse", page_icon="📊", layout="wide")

st.title("📊 DataPulse")
st.write("Análise de dados a partir de planilhas CSV.")

nome = st.text_input("Qual seu nome?")
if nome :
    st.success (f"Bem vindo ao DataPulse, {nome}!")

                