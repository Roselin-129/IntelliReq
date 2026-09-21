from preprocessor import NLPPreprocessor


processor = NLPPreprocessor()


text = """
The system shall allow users to register using their email address.
The system shall allow registered users to login.
The system should respond quickly.
"""


result = processor.process(text)


print("\n=== SENTENCES ===")

for sentence in result["sentences"]:
    print("-", sentence)


print("\n=== TOKENS ===")
print(result["tokens"])


print("\n=== LEMMAS ===")
print(result["lemmas"])


print("\n=== KEYWORDS ===")
print(result["keywords"])


print("\n=== ENTITIES ===")
print(result["entities"])


print("\n=== METRICS ===")
print("Sentence count:", result["sentence_count"])
print("Token count:", result["token_count"])