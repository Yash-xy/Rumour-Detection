from backend.verify_claim import load_metadata # type: ignore
m = load_metadata()
print('META_TYPE:', type(m))
print('META_SHAPE:', getattr(m, 'shape', None))
print('HEAD:', m.head(1).to_dict(orient='records'))
